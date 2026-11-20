Summary of i18n Work

- Added shared language bootstrap and CSS:
  - assets/i18n.js: detects initial language (localStorage → browser language → en), wraps existing page setLang to persist selection, set <html lang> and keep switcher buttons in sync.
  - assets/i18n.css: hides duplicate bilingual snippets so only the selected language is shown (e.g., .pl-ja and .instruction-ja), plus a generic [data-only-lang] helper.

- Integrated the shared assets on all pages:
  - Linked assets/i18n.css and loaded assets/i18n.js (defer) in: index.html and all subpages (access, circuit-breaker, emergency, equipment, gas-reset, house-rules, how-to-open, laundry, nearby-shops, parking, taxi, trash).
  - For pages that lacked persistence or browser-language detection, adjusted their inline setLang to set document.documentElement.lang and save to localStorage; the shared script now normalizes and applies the initial language consistently.

- Kept existing design, layout, images, and paths unchanged. URLs are unchanged. No access codes were found in content; the "How to Open" page contains guidance only and explicitly states codes are sent after registration.

- Result: All pages now have a 6-language switcher that switches visible text, persists the user’s choice across pages, and defaults to the browser language when first visited. Duplicate bilingual labels are suppressed so only the chosen language is displayed.
