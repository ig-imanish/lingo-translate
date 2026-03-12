// ── Languages Database ──
const LANGUAGES = [
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'bs', name: 'Bosnian', flag: '🇧🇦' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', name: 'Catalan', flag: '🌍' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'mn', name: 'Mongolian', flag: '🇲🇳' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
  { code: 'nb', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'sw', name: 'Swahili', flag: '🌍' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'uz', name: 'Uzbek', flag: '🇺🇿' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
];

// ── State ──
let selectedLang = null;
let keepOriginal = false;
let isTranslated = false;
let isTranslating = false;
let apiKey = '';
let currentDomain = '';
let rememberThisSite = false;

// ── DOM refs ──
const apiKeyInput     = document.getElementById('apiKeyInput');
const toggleApiVis    = document.getElementById('toggleApiVisibility');
const langSearch      = document.getElementById('langSearch');
const langList        = document.getElementById('langList');
const translateBtn    = document.getElementById('translateBtn');
const restoreBtn      = document.getElementById('restoreBtn');
const statusDot       = document.getElementById('statusDot');
const statusText      = document.getElementById('statusText');
const statusPage      = document.getElementById('statusPage');
const progressWrap    = document.getElementById('progressWrap');
const progressFill    = document.getElementById('progressFill');
const progressLabel   = document.getElementById('progressLabel');
const keepOriginalSw  = document.getElementById('keepOriginalSwitch');
const toast           = document.getElementById('toast');
const wordCount       = document.getElementById('wordCount');
const rememberSiteSw  = document.getElementById('rememberSiteSwitch');
const rememberSiteRow = document.getElementById('rememberSiteRow');
const rememberLabel   = document.getElementById('rememberSiteLabel');

// ── Init ──
async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Get domain
  if (tab && tab.url) {
    try {
      currentDomain = new URL(tab.url).hostname;
      statusPage.textContent = currentDomain;
    } catch (_) {}
  }

  // Load all saved settings
  const data = await chrome.storage.local.get([
    'apiKey', 'selectedLang', 'keepOriginal', 'activeTranslations'
  ]);

  if (data.apiKey) { apiKey = data.apiKey; apiKeyInput.value = data.apiKey; }
  if (data.selectedLang) selectedLang = data.selectedLang;
  keepOriginal = data.keepOriginal || false;
  if (keepOriginal) keepOriginalSw.classList.add('on');

  // Check if this domain is remembered
  const activeTranslations = data.activeTranslations || {};
  const domainState = currentDomain ? (activeTranslations[currentDomain] || {}) : {};
  rememberThisSite = !!domainState.enabled;

  // If domain has a saved lang preference, use that
  if (domainState.enabled && domainState.lang) {
    const saved = LANGUAGES.find(l => l.code === domainState.lang);
    if (saved) selectedLang = saved;
  }

  updateRememberUI();
  renderLangList('');

  // Check if page is currently translated
  if (tab && tab.id) {
    try {
      const result = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATE' });
      if (result && result.isTranslated) {
        isTranslated = true;
        restoreBtn.disabled = false;
        const langName = selectedLang ? selectedLang.name : result.lang;
        setStatus('active', 'Translated to ' + langName);
      } else {
        setStatus(rememberThisSite ? 'active' : 'ready',
          rememberThisSite ? 'Auto-translate ON for this site' : 'Ready to translate');
      }
    } catch (_) {
      setStatus('ready', 'Ready to translate');
    }
  }

  updateUI();
}

// ── Remember-site UI ──
function updateRememberUI() {
  if (!currentDomain) return;
  rememberLabel.textContent = rememberThisSite
    ? 'Always translate ' + currentDomain
    : 'Remember for ' + currentDomain;
  if (rememberThisSite) {
    rememberSiteSw.classList.add('on');
  } else {
    rememberSiteSw.classList.remove('on');
  }
}

// ── Render language list ──
function renderLangList(query) {
  const filtered = query
    ? LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.code.toLowerCase().includes(query.toLowerCase()))
    : LANGUAGES;

  if (!filtered.length) {
    langList.innerHTML = '<div class="no-results">No languages found</div>';
    return;
  }

  langList.innerHTML = filtered.map(lang => `
    <div class="lang-item ${selectedLang && selectedLang.code === lang.code ? 'selected' : ''}"
         data-code="${lang.code}" data-name="${lang.name}" data-flag="${lang.flag}">
      <span class="lang-flag">${lang.flag}</span>
      <div class="lang-item-info">
        <div class="lang-item-name">${lang.name}</div>
        <div class="lang-item-code">${lang.code}</div>
      </div>
      <svg class="lang-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>`).join('');

  const sel = langList.querySelector('.selected');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

// ── Status ──
function setStatus(type, text) {
  statusDot.className = 'status-dot';
  if (type === 'active') statusDot.classList.add('active');
  else if (type === 'error') statusDot.classList.add('error');
  else if (type === 'loading') statusDot.classList.add('loading');
  statusText.textContent = text;
}

// ── UI enabled/disabled state ──
function updateUI() {
  const canTranslate = apiKey.trim() && selectedLang && !isTranslating;
  translateBtn.disabled = !canTranslate;
  restoreBtn.disabled = !isTranslated || isTranslating;
}

// ── Toast ──
let toastTimer = null;
function showToast(message, type) {
  toast.textContent = message;
  toast.className = 'toast ' + (type || '') + ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 2800);
}

// ── API key input ──
apiKeyInput.addEventListener('input', async () => {
  apiKey = apiKeyInput.value.trim();
  await chrome.storage.local.set({ apiKey });
  updateUI();
});

// ── Show/hide API key ──
toggleApiVis.addEventListener('click', () => {
  const isPw = apiKeyInput.type === 'password';
  apiKeyInput.type = isPw ? 'text' : 'password';
  toggleApiVis.innerHTML = isPw
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
});

// ── Language search ──
langSearch.addEventListener('input', () => renderLangList(langSearch.value));

// ── Language selection ──
langList.addEventListener('click', async (e) => {
  const item = e.target.closest('.lang-item');
  if (!item) return;
  selectedLang = { code: item.dataset.code, name: item.dataset.name, flag: item.dataset.flag };
  await chrome.storage.local.set({ selectedLang });

  // If remember is on, update domain lang preference too
  if (rememberThisSite && currentDomain) {
    await saveDomainState(true);
  }

  renderLangList(langSearch.value);
  updateUI();
});

// ── Keep-original toggle ──
keepOriginalSw.parentElement.addEventListener('click', async () => {
  keepOriginal = !keepOriginal;
  keepOriginal ? keepOriginalSw.classList.add('on') : keepOriginalSw.classList.remove('on');
  await chrome.storage.local.set({ keepOriginal });
});

// ── Remember-site toggle ──
rememberSiteSw.parentElement.addEventListener('click', async () => {
  rememberThisSite = !rememberThisSite;
  await saveDomainState(rememberThisSite);
  updateRememberUI();
  if (rememberThisSite) {
    showToast('✓ Will auto-translate ' + currentDomain + ' on every visit', 'success');
    setStatus('active', 'Auto-translate ON for this site');
  } else {
    showToast('Auto-translate disabled for ' + currentDomain);
    setStatus('ready', 'Ready to translate');
  }
});

async function saveDomainState(enabled) {
  const langCode = selectedLang ? selectedLang.code : null;
  await chrome.runtime.sendMessage({
    type: 'SET_DOMAIN_ACTIVE',
    domain: currentDomain,
    lang: langCode,
    enabled,
  });
}

// ── Translate button ──
translateBtn.addEventListener('click', async () => {
  if (!apiKey.trim()) { showToast('Please enter your API key', 'error'); return; }
  if (!selectedLang)  { showToast('Please select a target language', 'error'); return; }
  if (isTranslating) return;

  isTranslating = true;
  translateBtn.className = 'translate-btn loading';
  translateBtn.innerHTML = '<div class="btn-spinner"></div> Translating...';
  setStatus('loading', 'Translating to ' + selectedLang.name + '...');
  progressWrap.classList.add('visible');
  progressFill.style.width = '5%';
  progressLabel.textContent = 'Starting...';
  updateUI();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
  } catch (_) {}

  chrome.tabs.sendMessage(tab.id, {
    type: 'TRANSLATE_PAGE',
    apiKey,
    targetLocale: selectedLang.code,
    keepOriginal,
  });

  // If remember is on, persist the domain state so next visit auto-translates
  if (rememberThisSite && currentDomain) {
    await saveDomainState(true);
  }
});

// ── Restore button ──
restoreBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: 'RESTORE_PAGE' });
  isTranslated = false;
  restoreBtn.disabled = true;
  setStatus(rememberThisSite ? 'active' : 'ready',
    rememberThisSite ? 'Auto-translate ON — will re-translate on next load' : 'Original restored');
  showToast('Page restored to original');
  wordCount.textContent = '';
});

// ── Progress & result messages from content script ──
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TRANSLATE_PROGRESS') {
    progressFill.style.width = msg.percent + '%';
    progressLabel.textContent = msg.label;
    if (msg.wordsCount) wordCount.textContent = '~' + msg.wordsCount + ' words';
  }

  if (msg.type === 'TRANSLATE_DONE') {
    isTranslating = false;
    isTranslated = true;
    translateBtn.className = 'translate-btn';
    translateBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg> Translate Page`;
    progressWrap.classList.remove('visible');
    setStatus('active', 'Translated to ' + (selectedLang ? selectedLang.name : msg.lang));
    restoreBtn.disabled = false;
    const flag = selectedLang ? selectedLang.flag : '';
    showToast(flag + ' Translated to ' + (selectedLang ? selectedLang.name : msg.lang) + '!', 'success');
    updateUI();
  }

  if (msg.type === 'TRANSLATE_ERROR') {
    isTranslating = false;
    translateBtn.className = 'translate-btn';
    translateBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg> Translate Page`;
    progressWrap.classList.remove('visible');
    setStatus('error', 'Translation failed');
    showToast(msg.error || 'Translation failed. Check your API key.', 'error');
    updateUI();
  }
});

init();
