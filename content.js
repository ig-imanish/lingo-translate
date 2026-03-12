/**
 * LingoTranslate Content Script — Full-page + persistent + dynamic translation
 *
 * Fixes:
 *  1. AUTO_TRANSLATE message — background re-triggers this on every page load
 *     so navigation never resets the page back to original
 *  2. Entire DOM scanned (no visibility filter) — off-screen / hidden elements included
 *  3. MutationObserver catches lazy/dynamic content added after initial load
 *  4. WeakSet prevents double-translating nodes
 */

(function () {
  if (window.__LingoTranslateInjected) return;
  window.__LingoTranslateInjected = true;

  let isTranslated = false;
  let currentLang = null;
  let currentApiKey = null;
  let currentKeepOriginal = false;

  const originalTexts = new Map();      // textNode → original string
  const translatedNodes = new WeakSet();// nodes already translated

  let observer = null;
  let mutationQueue = new Set();
  let mutationTimer = null;
  const DEBOUNCE_MS = 600;

  const SKIP_TAGS = new Set([
    'script','style','noscript','code','pre',
    'textarea','input','select','option',
    'svg','math','canvas','video','audio',
  ]);

  // ── Collect ALL text nodes (no visibility filter) ──
  function getTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(
      root || document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (SKIP_TAGS.has(parent.tagName.toLowerCase())) return NodeFilter.FILTER_REJECT;
          if (translatedNodes.has(node)) return NodeFilter.FILTER_REJECT;
          if (parent.dataset && parent.dataset.lingoWrapped) return NodeFilter.FILTER_REJECT;

          const text = node.nodeValue && node.nodeValue.trim();
          if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
          if (/^[\d\s.,\-+%$€£¥()[\]{}|\/\\]+$/.test(text)) return NodeFilter.FILTER_REJECT;
          if (/^https?:\/\//.test(text)) return NodeFilter.FILTER_REJECT;
          if (/^[a-z_][a-zA-Z0-9_.]{0,39}$/.test(text) && !/\s/.test(text)) return NodeFilter.FILTER_REJECT;

          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  }

  function chunkArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function translateBatch(texts, apiKey, targetLocale) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'TRANSLATE_BATCH', texts, apiKey, targetLocale },
        (response) => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          if (response && response.error) return reject(new Error(response.error));
          resolve((response && response.translations) || []);
        }
      );
    });
  }

  function applyTranslations(nodes, translations) {
    nodes.forEach((node, i) => {
      const translated = translations[i];
      if (!translated || translated === (node.nodeValue && node.nodeValue.trim())) return;
      if (!originalTexts.has(node)) originalTexts.set(node, node.nodeValue);

      if (currentKeepOriginal) {
        const span = document.createElement('span');
        span.style.cssText = 'border-bottom:1px dotted rgba(0,112,243,0.4);cursor:help;';
        span.title = node.nodeValue;
        span.textContent = translated;
        span.dataset.lingoWrapped = 'true';
        if (node.parentNode) node.parentNode.replaceChild(span, node);
      } else {
        node.nodeValue = translated;
      }
      translatedNodes.add(node);
    });
  }

  async function translateNodes(nodes) {
    if (!nodes.length || !currentApiKey || !currentLang) return;
    const chunks = chunkArray(nodes, 30);
    for (const chunk of chunks) {
      try {
        const texts = chunk.map(n => (n.nodeValue && n.nodeValue.trim()) || '');
        const translated = await translateBatch(texts, currentApiKey, currentLang);
        applyTranslations(chunk, translated);
      } catch (_) {}
    }
  }

  // ── MutationObserver — catches lazy/infinite-scroll content ──
  function handleMutations(mutations) {
    if (!isTranslated) return;
    for (const mutation of mutations) {
      for (const added of mutation.addedNodes) {
        if (added.nodeType === Node.TEXT_NODE) {
          const text = added.nodeValue && added.nodeValue.trim();
          if (text && text.length >= 2 && !translatedNodes.has(added)) mutationQueue.add(added);
        } else if (added.nodeType === Node.ELEMENT_NODE) {
          getTextNodes(added).forEach(n => mutationQueue.add(n));
        }
      }
      if (
        mutation.type === 'characterData' &&
        mutation.target.nodeType === Node.TEXT_NODE &&
        !translatedNodes.has(mutation.target)
      ) {
        const text = mutation.target.nodeValue && mutation.target.nodeValue.trim();
        if (text && text.length >= 2) mutationQueue.add(mutation.target);
      }
    }
    if (!mutationQueue.size) return;
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(async () => {
      const batch = Array.from(mutationQueue).filter(n => n.isConnected && !translatedNodes.has(n));
      mutationQueue.clear();
      if (batch.length) await translateNodes(batch);
    }, DEBOUNCE_MS);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(handleMutations);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function stopObserver() {
    if (observer) { observer.disconnect(); observer = null; }
    clearTimeout(mutationTimer);
    mutationQueue.clear();
  }

  // ── Core translation runner (shared by manual + auto) ──
  async function runTranslation(apiKey, targetLocale, keepOriginal, silent) {
    currentApiKey = apiKey;
    currentLang = targetLocale;
    currentKeepOriginal = keepOriginal || false;

    const nodes = getTextNodes(document.body);
    if (!nodes.length) {
      if (!silent) chrome.runtime.sendMessage({ type: 'TRANSLATE_ERROR', error: 'No translatable text found.' });
      return;
    }

    const wordCount = nodes.reduce((s, n) => s + ((n.nodeValue && n.nodeValue.split(/\s+/).length) || 0), 0);
    if (!silent) sendProgress(8, 'Found ' + nodes.length + ' text nodes...', wordCount);

    const chunks = chunkArray(nodes, 30);
    for (let i = 0; i < chunks.length; i++) {
      const texts = chunks[i].map(n => (n.nodeValue && n.nodeValue.trim()) || '');
      try {
        const translated = await translateBatch(texts, apiKey, targetLocale);
        applyTranslations(chunks[i], translated);
      } catch (err) {
        if (!silent) chrome.runtime.sendMessage({ type: 'TRANSLATE_ERROR', error: err.message });
        return;
      }
      if (!silent) {
        const pct = 8 + Math.round(((i + 1) / chunks.length) * 86);
        sendProgress(pct, 'Translating batch ' + (i + 1) + ' / ' + chunks.length, wordCount);
      }
    }

    isTranslated = true;
    startObserver();

    if (!silent) {
      sendProgress(100, 'Done!', wordCount);
      chrome.runtime.sendMessage({ type: 'TRANSLATE_DONE', lang: targetLocale });
    }
  }

  // ── Manual translate (from popup button) ──
  async function translatePage(msg) {
    if (isTranslated) await restorePage();
    await runTranslation(msg.apiKey, msg.targetLocale, msg.keepOriginal, false);
  }

  // ── Auto translate (triggered by background on navigation) ──
  async function autoTranslate(msg) {
    if (isTranslated) return; // Already translated, skip
    await runTranslation(msg.apiKey, msg.targetLocale, msg.keepOriginal, true);
  }

  // ── Restore original ──
  async function restorePage() {
    if (!isTranslated) return;
    stopObserver();
    originalTexts.forEach((original, node) => {
      if (node.isConnected) node.nodeValue = original;
    });
    document.querySelectorAll('[data-lingo-wrapped]').forEach(span => {
      span.replaceWith(document.createTextNode(span.title));
    });
    originalTexts.clear();
    isTranslated = false;
    currentLang = null;
  }

  function sendProgress(percent, label, wordsCount) {
    chrome.runtime.sendMessage({ type: 'TRANSLATE_PROGRESS', percent, label, wordsCount });
  }

  // ── Message listener ──
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'GET_STATE') {
      sendResponse({ isTranslated, lang: currentLang });
      return true;
    }
    if (msg.type === 'TRANSLATE_PAGE') {
      translatePage(msg).catch(err =>
        chrome.runtime.sendMessage({ type: 'TRANSLATE_ERROR', error: err.message })
      );
      sendResponse({ started: true });
      return true;
    }
    if (msg.type === 'AUTO_TRANSLATE') {
      autoTranslate(msg).catch(() => {});
      sendResponse({ started: true });
      return true;
    }
    if (msg.type === 'RESTORE_PAGE') {
      restorePage().then(() => sendResponse({ restored: true }));
      return true;
    }
  });

})();
