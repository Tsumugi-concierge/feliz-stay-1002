/* Shared i18n bootstrapper for Feliz Stay static pages
 * - Detects initial language (localStorage -> browser -> 'en')
 * - Wraps existing window.setLang(lang, btn) to persist selection and set <html lang>
 * - Activates .lang-btn states consistently
 * Pages keep their own translation maps and setLang logic; this script only coordinates. */
(function(){
  const SUPPORTED = ['en','ja','zh','ko','fr','es'];
  const LS_KEY = 'felizStayLang';

  function normalize(lang) {
    if (!lang) return null;
    const lc = String(lang).toLowerCase();
    // map common variants
    const m = lc.match(/^[a-z]{2}/);
    const base = m ? m[0] : lc;
    if (base === 'zh') return 'zh';
    if (base === 'en') return 'en';
    if (base === 'ja') return 'ja';
    if (base === 'ko') return 'ko';
    if (base === 'fr') return 'fr';
    if (base === 'es') return 'es';
    return null;
  }

  function detectInitial() {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && SUPPORTED.includes(saved)) return saved;
    } catch(e) {}

    const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]).filter(Boolean);
    for (const l of langs) {
      const n = normalize(l);
      if (n && SUPPORTED.includes(n)) return n;
    }
    return 'en';
  }

  function persist(lang) {
    try { localStorage.setItem(LS_KEY, lang); } catch(e) {}
  }

  function setHtmlLang(lang) {
    const html = document.documentElement;
    if (html.lang !== lang) html.lang = lang;
    // manage helper class
    SUPPORTED.forEach(code => html.classList.remove('lang-' + code));
    html.classList.add('lang-' + lang);
  }

  function findBtnFor(lang) {
    // Match common inline handler pattern used by pages: onclick="setLang('xx', this)"
    let btn = document.querySelector(".lang-btn[onclick=\"setLang('"+lang+"', this)\"]");
    if (!btn) {
      // Nearby shops has minor spacing differences
      btn = Array.from(document.querySelectorAll('.lang-btn')).find(b => (b.getAttribute('onclick')||'').includes("setLang('"+lang+"'"));
    }
    return btn || null;
  }

  function activateBtns(activeLang) {
    document.querySelectorAll('.lang-btn').forEach(b => {
      // crude parse: first arg value in onclick
      const oc = b.getAttribute('onclick') || '';
      const m = oc.match(/setLang\('([a-z]{2})'/i);
      const code = m ? m[1].toLowerCase() : '';
      b.classList.toggle('active', code === activeLang);
    });
  }

  function wrapSetLang() {
    if (typeof window.setLang !== 'function') return false;
    if (window.setLang.__wrapped__) return true;
    const orig = window.setLang;
    const wrapped = function(lang, btn){
      const res = orig.apply(this, arguments);
      const code = (lang||'').toLowerCase();
      if (SUPPORTED.includes(code)) {
        setHtmlLang(code);
        activateBtns(code);
        persist(code);
      }
      return res;
    };
    wrapped.__wrapped__ = true;
    window.setLang = wrapped;
    return true;
  }

  function init() {
    const initial = detectInitial();
    // ensure wrapper installed after page defines its setLang
    wrapSetLang();

    // If page has already set an appropriate lang, respect it
    const docLang = (document.documentElement.lang||'').toLowerCase();
    const effective = SUPPORTED.includes(docLang) ? docLang : initial;

    // Try to invoke page's setLang to apply translations
    if (typeof window.setLang === 'function') {
      const btn = findBtnFor(effective);
      window.setLang(effective, btn || undefined);
    }
    // Ensure html lang/class and active states are correct regardless
    setHtmlLang(effective);
    activateBtns(effective);
    persist(effective);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
