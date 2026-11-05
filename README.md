# Tadiran – Service & Warranty page (שירות ואחריות)

Embeddable page for the live Tadiran site, built to the TadiCore integration & scoping guidelines.

## What to ship

| File | Purpose |
|---|---|
| `css/styles.css` | All styles. Every rule is scoped under `#tadiran-service-page`. No `:root`, `html`, `body` or `*` rules. Keyframes are prefixed `tsw-`. |
| `js/main.js` | All behaviour, in one IIFE. All listeners are attached to `#tadiran-service-page` (none on `document`). |
| `index.html` → the `<div id="tadiran-service-page">…</div>` block | The page markup, including the SVG icon sprite, modals and toast. |
| `assets/` | Images used by the page (except `assets/icon-*.svg` and `logo-sadaf.svg`, which only the mock header/footer use). |

The page also needs the Open Sans font (Google Fonts link in `index.html`, weights 400–800).

## Preview only (do not ship)

- `preview/preview.css`, `preview/preview.js`: the client-review bar (desktop/mobile, My Tadiran on/off) and the mock site header/footer.
- The mock `<header class="gh">` and `<footer class="foot">` in `index.html`. The real ones come from the site.
- The five Tadiran site stylesheets linked at the top of `index.html` (Bootstrap, general, main, header-megamenu, style-rtl). They are loaded only to check that the page renders the same next to the live site styles. The site already loads them.

## Integration notes

- **Names that collide with Bootstrap or the theme are prefixed:** `.tsw-btn`, `.tsw-btn-primary`, `.tsw-btn-outline`, `.tsw-modal`, `.tsw-lead`, `.tsw-media`, `.tsw-close`, and the section ids `#tsw-warranty`, `#tsw-user-guide`, `#tsw-advisor`. The theme already styles `#warranty`, `#advisor` and `#user-guide` on the current contact page.
- **Host styles are neutralised inside the wrapper:** a small scoped reset covers Bootstrap and `style-rtl.css` element styles (headings, lists, buttons, inputs, labels, link colours). Two theme rules use `!important`: `*:focus{outline:0}` and `a{text-decoration:none}`. So the focus ring and the hover underlines are declared `!important` too, and they stay scoped.
- **Smooth scrolling:** in-page anchor clicks are handled only for links inside the wrapper. There is no global `scroll-behavior`.
- **Modals and toast** use `z-index` 10000 and 10001, so they sit above the mega-menu header (999). While a modal is open, `document.body.style.overflow` is set to `hidden` to lock page scroll. It is restored on close.
- **The warranty activation flow** uses the URL hash (`#activate2-<type>`) so the browser back button returns to the page. FAQ deep links use `#faq-<n>`.
- **The My Tadiran section** (`#my-tadiran`) shows only when the wrapper has the class `mt-on`. To show it, add `class="mt-on"` to `#tadiran-service-page`.
- **Mock data:** the serial check, the address lists and the form submit are simulated (no network calls). Connect them to the site's existing endpoints.
