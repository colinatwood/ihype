// ═══════════════════════════════════════════════════════════════════════
// iHYPE · shared interactions + i18n
// ═══════════════════════════════════════════════════════════════════════

(function(){

  // ─── i18n translation table ──────────────────────────────────────────
  // Keys match data-i18n attributes in the HTML.
  // Add new languages by adding a same-keyed block below.
  // Values are plain strings; use \n for line breaks where needed.

  // Translation strings are lazy-loaded per language from /public/i18n/{lang}.js
  // English is the fallback and is always available via window.__ihypeI18n
  var _langScriptCache = {};

  function _loadLangScript(lang, cb) {
    if (window.__ihypeI18n && window.__ihypeI18n[lang]) { cb(); return; }
    if (_langScriptCache[lang]) { _langScriptCache[lang].push(cb); return; }
    _langScriptCache[lang] = [cb];
    var s = document.createElement('script');
    s.src = '/i18n/' + lang + '.js';
    s.onload = function() {
      (_langScriptCache[lang] || []).forEach(function(fn){ fn(); });
      _langScriptCache[lang] = null;
    };
    document.head.appendChild(s);
  }

  // ─── Font map — one entry per supported language ─────────────────────
  // gfonts: Google Fonts URL to lazy-load; null = already loaded (Latin stack)
  // dir: text direction; defaults to 'ltr'

  var LANG_FONTS = {
    en: { d: "'Syne',sans-serif",                  b: "'DM Sans',sans-serif",                  m: "'JetBrains Mono',monospace",  gfonts: null },
    es: { d: "'Syne',sans-serif",                  b: "'DM Sans',sans-serif",                  m: "'JetBrains Mono',monospace",  gfonts: null },
    pt: { d: "'Syne',sans-serif",                  b: "'DM Sans',sans-serif",                  m: "'JetBrains Mono',monospace",  gfonts: null },
    fr: { d: "'Syne',sans-serif",                  b: "'DM Sans',sans-serif",                  m: "'JetBrains Mono',monospace",  gfonts: null },
    de: { d: "'Syne',sans-serif",                  b: "'DM Sans',sans-serif",                  m: "'JetBrains Mono',monospace",  gfonts: null },
    ar: { d: "'Noto Sans Arabic',sans-serif",       b: "'Noto Sans Arabic',sans-serif",          m: "'Noto Sans Arabic',monospace", dir: 'rtl',
          gfonts: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap' },
    hi: { d: "'Noto Sans Devanagari',sans-serif",   b: "'Noto Sans Devanagari',sans-serif",      m: "'Noto Sans Devanagari',monospace",
          gfonts: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap' },
    ja: { d: "'Noto Sans JP',sans-serif",           b: "'Noto Sans JP',sans-serif",              m: "'Noto Sans JP',monospace",
          gfonts: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap' },
    ko: { d: "'Noto Sans KR',sans-serif",           b: "'Noto Sans KR',sans-serif",              m: "'Noto Sans KR',monospace",
          gfonts: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap' },
    zh: { d: "'Noto Sans SC',sans-serif",           b: "'Noto Sans SC',sans-serif",              m: "'Noto Sans SC',monospace",
          gfonts: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap' },
    ru: { d: "'Syne',sans-serif",                  b: "'DM Sans',sans-serif",                  m: "'JetBrains Mono',monospace",
          gfonts: 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&subset=cyrillic&display=swap' }
  };

  var _loadedFontHrefs = {};

  function applyLangFont(lang){
    var cfg = LANG_FONTS[lang] || LANG_FONTS['en'];
    // Lazy-load Google Font if this script doesn't bundle it
    if(cfg.gfonts && !_loadedFontHrefs[cfg.gfonts]){
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cfg.gfonts;
      document.head.appendChild(link);
      _loadedFontHrefs[cfg.gfonts] = true;
    }
    // Update CSS font-family variables so every element inherits instantly
    var root = document.documentElement;
    root.style.setProperty('--f-d', cfg.d);
    root.style.setProperty('--f-b', cfg.b);
    root.style.setProperty('--f-m', cfg.m);
    // Flip text direction for RTL scripts
    root.dir = cfg.dir || 'ltr';
  }

  // ─── i18n engine ─────────────────────────────────────────────────────

  var currentLang = 'en';

  function t(key){
    var i18n = window.__ihypeI18n || {};
    var strings = i18n[currentLang] || i18n['en'] || {};
    var fallback = i18n['en'] || {};
    return (strings[key] !== undefined ? strings[key] : (fallback[key] || key));
  }

  function applyTranslations(lang){
    var i18n = window.__ihypeI18n || {};
    if (!i18n[lang]) {
      _loadLangScript(lang, function(){ applyTranslations(lang); });
      return;
    }
    currentLang = lang;
    document.documentElement.lang = lang;
    applyLangFont(lang);
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      el.innerHTML = t(key);
    });
    document.querySelectorAll('[data-lang]').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem('ihype-lang', lang); } catch(e){}
  }

  // Restore saved language
  function restoreLang(){
    try {
      var saved = localStorage.getItem('ihype-lang');
      if(!saved){
        var browserLang = (navigator.language || 'en').slice(0,2).toLowerCase();
        if(LANG_FONTS[browserLang]) saved = browserLang;
      }
      if(saved) applyTranslations(saved);
    } catch(e){}
  }

  // ─── Accessibility helpers ───────────────────────────────────────────

  function applyToggle(name, on){
    var html = document.documentElement;
    if(name === 'dyslexia') html.classList.toggle('dyslexia-mode', on);
    if(name === 'contrast')  html.classList.toggle('high-contrast', on);
    if(name === 'motion')    html.classList.toggle('reduce-motion', on);
    document.querySelectorAll('[data-toggle="'+name+'"]').forEach(function(el){
      if(el.classList.contains('switch')){
        el.classList.toggle('on', on);
      }
    });
    try { localStorage.setItem('ihype-a11y-'+name, on ? '1' : '0'); } catch(e){}
  }

  function applySize(size){
    var html = document.documentElement;
    html.classList.remove('size-large','size-xlarge');
    if(size === 'large')  html.classList.add('size-large');
    if(size === 'xlarge') html.classList.add('size-xlarge');
    document.querySelectorAll('[data-size]').forEach(function(s){
      s.classList.toggle('active', s.dataset.size === size);
    });
    try { localStorage.setItem('ihype-a11y-size', size); } catch(e){}
  }

  function restore(){
    try {
      var size = localStorage.getItem('ihype-a11y-size');
      if(size) applySize(size);
      ['dyslexia','contrast','motion'].forEach(function(n){
        if(localStorage.getItem('ihype-a11y-'+n) === '1') applyToggle(n, true);
      });
    } catch(e){}
  }

  // ─── Wire up events after DOM ready ──────────────────────────────────

  function init(){
    restore();
    restoreLang();

    // Language buttons (data-lang on any button anywhere)
    document.querySelectorAll('[data-lang]').forEach(function(btn){
      btn.addEventListener('click', function(){
        applyTranslations(btn.getAttribute('data-lang'));
      });
    });

    // Size radio groups
    document.querySelectorAll('.toggle-pair[role="radiogroup"], .toggle-pair[data-radio]').forEach(function(g){
      g.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click', function(){
          g.querySelectorAll('button').forEach(function(x){ x.classList.remove('active'); });
          b.classList.add('active');
          if(b.dataset.size) applySize(b.dataset.size);
        });
      });
    });

    // Switch toggles
    document.querySelectorAll('.switch').forEach(function(s){
      s.addEventListener('click', function(){
        s.classList.toggle('on');
        if(s.dataset.toggle) applyToggle(s.dataset.toggle, s.classList.contains('on'));
      });
    });

    // Multi-toggle option buttons
    document.querySelectorAll('button[data-toggle]:not(.switch)').forEach(function(b){
      b.addEventListener('click', function(){
        b.classList.toggle('active');
        applyToggle(b.dataset.toggle, b.classList.contains('active'));
      });
    });

    // Persistent panel open/close
    var panel   = document.getElementById('a11yPanel');
    var overlay = document.getElementById('a11yOverlay');
    var opener  = document.getElementById('openA11y');
    var closer  = document.getElementById('closeA11y');
    function openP(){ if(panel){ panel.classList.add('open'); overlay && overlay.classList.add('open'); }}
    function closeP(){ if(panel){ panel.classList.remove('open'); overlay && overlay.classList.remove('open'); }}
    opener  && opener.addEventListener('click', openP);
    closer  && closer.addEventListener('click', closeP);
    overlay && overlay.addEventListener('click', closeP);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && panel && panel.classList.contains('open')) closeP();
    });

    // OTP input auto-advance
    document.querySelectorAll('.otp-input').forEach(function(inp, i, arr){
      inp.addEventListener('input', function(){
        if(inp.value.length >= 1){
          inp.classList.add('filled');
          if(arr[i+1]) arr[i+1].focus();
        }
      });
      inp.addEventListener('keydown', function(e){
        if(e.key === 'Backspace' && !inp.value && arr[i-1]) arr[i-1].focus();
      });
    });

    // Generic tab groups
    document.querySelectorAll('[data-tabs]').forEach(function(group){
      var target = group.dataset.tabs;
      group.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click', function(){
          group.querySelectorAll('button').forEach(function(x){ x.classList.remove('active'); });
          b.classList.add('active');
          if(b.dataset.tab && target){
            document.querySelectorAll('[data-tab-content="'+target+'"]').forEach(function(c){
              c.style.display = (c.dataset.tabId === b.dataset.tab) ? '' : 'none';
            });
          }
        });
      });
    });
  }

  // Run after DOM is parsed
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
