/**
 * LingoTranslate Background Service Worker
 *
 * Responsibilities:
 *  1. Proxy lingo.dev API calls (avoids CORS in content scripts)
 *  2. Listen for tab navigations — auto re-inject & retranslate if domain is active
 *  3. Handle per-domain & global translation state in chrome.storage
 */

// ── Tab navigation listener ──
// When a tab finishes loading, check if translation is active for that domain
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only fire when the page is fully loaded
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || !tab.url.startsWith('http')) return;

  const domain = getDomain(tab.url);
  if (!domain) return;

  const data = await chrome.storage.local.get(['activeTranslations', 'apiKey', 'selectedLang', 'keepOriginal']);
  const activeTranslations = data.activeTranslations || {};

  const domainState = activeTranslations[domain];
  if (!domainState || !domainState.enabled) return;
  if (!data.apiKey) return;

  const lang = domainState.lang || (data.selectedLang && data.selectedLang.code);
  if (!lang) return;

  // Inject content script first (idempotent — guard inside content.js prevents double-run)
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (_) {}

  // Small delay to let the page settle after inject
  setTimeout(() => {
    chrome.tabs.sendMessage(tabId, {
      type: 'AUTO_TRANSLATE',
      apiKey: data.apiKey,
      targetLocale: lang,
      keepOriginal: data.keepOriginal || false,
    }).catch(() => {});
  }, 400);
});

// ── Message router ──
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'TRANSLATE_BATCH') {
    handleTranslateBatch(msg)
      .then(translations => sendResponse({ translations }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (msg.type === 'SET_DOMAIN_ACTIVE') {
    setDomainActive(msg.domain, msg.lang, msg.enabled).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === 'GET_DOMAIN_STATE') {
    getDomainState(msg.domain).then(state => sendResponse(state));
    return true;
  }
});

// ── Domain helpers ──
function getDomain(url) {
  try { return new URL(url).hostname; } catch (_) { return null; }
}

async function setDomainActive(domain, lang, enabled) {
  const data = await chrome.storage.local.get('activeTranslations');
  const activeTranslations = data.activeTranslations || {};
  if (enabled) {
    activeTranslations[domain] = { enabled: true, lang, savedAt: Date.now() };
  } else {
    delete activeTranslations[domain];
  }
  await chrome.storage.local.set({ activeTranslations });
}

async function getDomainState(domain) {
  const data = await chrome.storage.local.get('activeTranslations');
  const activeTranslations = data.activeTranslations || {};
  return activeTranslations[domain] || { enabled: false };
}

// ── lingo.dev API call ──
async function handleTranslateBatch({ texts, apiKey, targetLocale }) {
  const data = {};
  texts.forEach((text, i) => {
    const t = (text || '').trim();
    if (t) data[`t${i}`] = t;
  });

  if (Object.keys(data).length === 0) return texts;

  const response = await fetch('https://api.lingo.dev/process/localize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      sourceLocale: 'en',
      targetLocale,
      data,
    }),
  });

  if (!response.ok) {
    let errMsg = `API Error ${response.status}`;
    try {
      const errData = await response.json();
      errMsg = errData?.message || errData?.error || errMsg;
    } catch (_) {}
    if (response.status === 401) throw new Error('Invalid API key — get yours at lingo.dev');
    if (response.status === 429) throw new Error('Rate limit reached — wait a moment and try again');
    throw new Error(errMsg);
  }

  const result = await response.json();
  const translated = result?.data || result || {};
  return texts.map((original, i) => translated[`t${i}`] || original);
}
