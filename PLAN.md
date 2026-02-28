# PLAN.md — Lightbox2 Codebase Evaluation & Recommendations

## To-Do

### Phase 1: Quick wins (v2.x safe)
- [x] Fix resize handler memory leak — store `$.proxy` ref and reuse for `off()` (Section 3)
- [x] Fix `.lb-prevLink`/`.lb-nextLink` dead selectors → `.lb-prev`/`.lb-next` (Section 3)
- [x] Add `preloader.onerror` handler — hide loader, show error state (Section 3)
- [x] Fix SVG detection for URLs with query strings/fragments (Section 3)
- [x] Cancel pending image loads on rapid navigation (Section 3)
- [x] Cache repeated `this.$lightbox.find()` calls in `build()` (Section 7)

### Phase 2: Accessibility & security (v2.x safe)
- [x] Add `role="dialog"`, `aria-modal="true"`, `aria-label` to `#lightbox` (Section 1)
- [x] Implement focus trap — constrain Tab to lightbox when open (Section 1)
- [x] Restore focus to trigger element on close (Section 1)
- [x] Add `aria-describedby` linking image to caption (Section 1)
- [x] Add `aria-live="polite"` to `.lb-number` (Section 1)
- [ ] ~~Default `sanitizeTitle` to `true`~~ SKIPPED — breaking change (Section 2)
- [x] Fix selector injection — use `.filter()` instead of string concatenation (Section 2)

### Phase 3: CSS & API improvements (v2.x safe)
- [x] Remove stale vendor prefixes (Section 5)
- [x] Switch overlay to `position: fixed; inset: 0`, remove JS `sizeOverlay()` (Section 5)
- [x] Add CSS custom properties for theming (Section 5)
- [x] Expose public API: `open()`, `close()`, `next()`, `prev()`, `destroy()` (Section 6)
- [x] Add jQuery custom events: `lightbox:open`, `lightbox:close`, `lightbox:change` (Section 6)
- [x] Debounce window resize handler (Section 7)

### Phase 4: Code quality (v2.x safe)
- [x] Replace `void 0` with `undefined` (Section 10)
- [x] Fix `i = ++i` loop increments to `i++` (Section 10)
- [x] Use `self` consistently instead of mixing `self`/`.bind()` (Section 10)
- [x] Replace `return false` with `event.preventDefault()` where appropriate (Section 10)

### Phase 5: Modernize tooling (v3.0)
- [x] Replace Bower with npm for jQuery (Section 4)
- [x] Replace JSHint + JSCS with ESLint (Section 4)
- [x] Replace Grunt with npm scripts or esbuild/Rollup (Section 4)

### Phase 6: Drop jQuery & rewrite (v3.0)
- [ ] Rewrite to vanilla JS using native DOM APIs (Section 8)
- [ ] Replace jQuery animations with CSS transitions + class toggles (Section 7)
- [ ] Replace PNG/GIF icon assets with inline SVGs (Section 5)
- [ ] Replace float layout with flexbox (Section 5)
- [ ] Export constructor/class instead of singleton instance (Section 6)
- [ ] Implement EventTarget for event emission (Section 6)

### Phase 7: Testing (v3.0)
- [ ] Set up test runner (Vitest + jsdom or Playwright) (Section 9)
- [ ] Tests: album building — single, grouped, `rel`, mixed (Section 9)
- [ ] Tests: navigation — forward, backward, wrap-around, keyboard, boundaries (Section 9)
- [ ] Tests: image sizing — viewport fit, maxWidth/maxHeight, SVG, aspect ratio (Section 9)
- [ ] Tests: open/close lifecycle — focus, scroll lock, listener cleanup (Section 9)
- [ ] Tests: error handling — 404 image, missing href (Section 9)
- [ ] Tests: edge cases — special chars in `data-lightbox`, rapid clicking (Section 9)

---

## Summary

Lightbox2 is a well-crafted, stable library that has served the community for years. This evaluation examines the codebase as it stands today and identifies concrete improvements, ordered by impact. The project is in maintenance mode for v2.x, so recommendations are split into **v2.x maintenance fixes** (safe, backwards-compatible) and **v3.0 architectural changes** (breaking).

---

## 1. Accessibility (High Impact)

### Current state
The lightbox has basic keyboard support (Esc, arrows) and some ARIA labels on nav buttons. But it falls short of WCAG 2.1 guidelines in several ways.

### Issues

- **No focus trap.** When the lightbox is open, Tab can move focus to elements behind the overlay. Screen reader users and keyboard users can interact with the page underneath.
- **No `aria-modal="true"`.** The lightbox overlay functions as a modal dialog but doesn't announce itself as one. Screen readers won't know the rest of the page is inert.
- **No `role="dialog"` or `aria-label` on the lightbox container.** Screen readers have no context about what opened.
- **Focus not restored on close.** After closing the lightbox, focus is lost instead of returning to the trigger element that opened it.
- **Nav arrows use `<a href="">`.** Empty hrefs are semantically wrong for buttons. They should be `<button>` elements or at minimum have `role="button"` (partially done) and `href` removed.
- **Caption not linked to image via `aria-describedby`.** Screen readers don't associate the caption with the displayed image.
- **Image counter is visual-only.** The "Image 2 of 5" label should be available to screen readers, ideally as a live region so it's announced on image change.
- **Touch detection is unreliable.** `document.createEvent('TouchEvent')` in `updateNav()` is a poor heuristic. Many laptops have touch screens but also have hover. Better to use `@media (hover: none)` in CSS or `matchMedia` in JS.

### Recommended changes (v2.x safe)
- Add `role="dialog"`, `aria-modal="true"`, and `aria-label="Image lightbox"` to `#lightbox`.
- Implement a focus trap: on open, constrain Tab to lightbox elements; on close, restore focus to the triggering `<a>`.
- Store `this.$triggerElement` in `start()` and call `this.$triggerElement.trigger('focus')` in `end()`.
- Add `aria-describedby` linking the image to the caption.
- Add `aria-live="polite"` to `.lb-number` so image counter changes are announced.

---

## 2. Security (High Impact)

### Issues

- **`sanitizeTitle` defaults to `false`.** The caption is injected as raw HTML via `$caption.html(title)`. If `data-title` values come from a CMS, database, or URL parameters, this is an XSS vector. Any user-generated content scenario is vulnerable by default.
- **Selector injection in `start()`.** The album grouping builds a jQuery selector by string concatenation:
  ```js
  $($link.prop('tagName') + '[data-lightbox="' + dataLightboxValue + '"]')
  ```
  If `data-lightbox` contains characters like `"]`, this breaks or enables selector injection. Not exploitable for XSS in practice, but causes bugs with special characters in gallery names.

### Recommended changes (v2.x safe)
- Change `sanitizeTitle` default to `true`. This is technically breaking for anyone relying on HTML in captions, but the security benefit is significant. Document the change prominently.
- Use `.filter()` instead of building selectors from attribute values:
  ```js
  $links = $(tagName).filter(function() {
    return $(this).attr('data-lightbox') === dataLightboxValue;
  });
  ```

---

## 3. Bugs & Correctness (High Impact)

### Issues

- **`preloader.onerror` is never handled.** If an image fails to load (404, network error), the lightbox shows the loader indefinitely. No error state, no way to dismiss gracefully. Users are stuck.
- **`this` binding bug in `build()` line 195.** Inside the contextmenu handler:
  ```js
  setTimeout(function() {
    this.$nav.css('pointer-events', 'auto');
  }.bind(self), 0);
  ```
  The `.bind(self)` is correct, but earlier on line 195 it says `this.$nav` — this works because of the bind, but the surrounding code (line 191) uses `self.$nav`. The inconsistency is confusing. Use `self` consistently.
- **Resize handler leak.** `start()` binds `$(window).on('resize', ...)` using `$.proxy`. But `end()` tries to unbind with `$(window).off('resize', this.sizeOverlay)`. Since `$.proxy` creates a new function, the reference doesn't match and the handler is never unbound. Each open/close cycle leaks a resize listener.
- **Race condition in `changeImage()`.** If a user rapidly clicks next/prev, multiple `preloader.onload` callbacks can fire, causing layout glitches. There's no mechanism to cancel a pending image load.
- **SVG file type detection is naive.** `filename.split('.').slice(-1)[0]` fails for URLs with query strings (`image.svg?v=2`) or fragment identifiers. Also fails for URLs without extensions.
- **`.lb-prevLink` and `.lb-nextLink` referenced in `sizeContainer()` but never exist in the DOM.** Lines 412-413 query `.lb-prevLink` and `.lb-nextLink`, but the actual classes are `.lb-prev` and `.lb-next`. This code silently does nothing.

### Recommended changes (v2.x safe)
- Add `preloader.onerror` handler that hides the loader, shows an error message or the next image, and logs a console warning.
- Fix the resize handler leak: store the proxied function and use the same reference for `off()`.
  ```js
  this._sizeOverlayProxy = $.proxy(this.sizeOverlay, this);
  $window.on('resize', this._sizeOverlayProxy);
  // in end():
  $(window).off('resize', this._sizeOverlayProxy);
  ```
- Cancel pending image loads in `changeImage()` by nulling the previous preloader's `onload`.
- Fix SVG detection to strip query strings: `filename.split('?')[0].split('.').slice(-1)[0]`.
- Fix `.lb-prevLink`/`.lb-nextLink` to `.lb-prev`/`.lb-next` in `sizeContainer()`.

---

## 4. Build Tooling (Medium Impact)

### Current state
Grunt, Bower, JSHint, and JSCS. All four are effectively abandoned projects.

### Issues

- **Bower** has been deprecated since 2017 and tells users to switch to npm/yarn.
- **Grunt** is rarely maintained. The ecosystem has moved to npm scripts, Rollup, esbuild, or Vite.
- **JSHint** is functional but superseded by ESLint which has better rules and plugin ecosystem.
- **JSCS** has been formally merged into ESLint and is unmaintained since 2016. Its npm page says "JSCS has merged with ESLint."
- **No CSS autoprefixer.** The CSS manually includes `-webkit-`, `-moz-`, and `-o-` prefixed properties. An autoprefixer step would keep these accurate and remove unnecessary ones.
- **No tests.** `grunt test` only runs linters. There are zero unit or integration tests.

### Recommended changes (v2.x safe)
- Replace Bower with npm for jQuery: `npm install jquery --save`.
- Replace JSHint + JSCS with ESLint (single config file).
- Add an autoprefixer step to the CSS build (postcss + autoprefixer).
- Consider replacing Grunt with npm scripts — the build is simple enough (copy, concat, uglify, cssmin) that a Gruntfile adds indirection without benefit.

### Recommended changes (v3.0)
- Drop the jQuery dependency entirely and use vanilla JS (see Section 8).
- Use a modern bundler (esbuild or Rollup) to produce UMD/ESM/CJS bundles from a modern source.
- Add a basic test suite (see Section 9).

---

## 5. CSS Issues (Medium Impact)

### Issues

- **Vendor prefixes are stale.** `-webkit-transition`, `-moz-transition`, `-o-transition` haven't been needed since ~2013. They add dead bytes.
- **`position: absolute` for overlay instead of `position: fixed`.** The overlay uses `position: absolute` and is sized to `$(document).width()/height()` via JS. A `position: fixed` overlay with `inset: 0` would cover the viewport natively without JS sizing, and would handle scroll correctly.
- **Clearfix hack (`:after { content: ""; display: table; clear: both }`)** is used for float-based layout. Flexbox would be simpler and more robust.
- **Magic numbers.** Hard-coded values like `z-index: 9999/10000`, the 250px initial container size, `top: 43%` for the loader, `34%/64%` split for prev/next zones — none are documented or tokenized.
- **No CSS custom properties.** Colors, durations, and spacing are hard-coded, making theming impossible without overriding many selectors.
- **Image assets for UI icons.** close.png, loading.gif, prev.png, next.png require HTTP requests and don't scale for high-DPI displays. Inline SVGs or CSS-only solutions would be sharper and eliminate the image path configuration issue that causes many bug reports.

### Recommended changes (v2.x safe)
- Remove vendor prefixes (or add autoprefixer to the build).
- Switch overlay to `position: fixed; inset: 0` and remove the JS `sizeOverlay()` method.
- Add CSS custom properties for the most commonly themed values:
  ```css
  :root {
    --lb-overlay-opacity: 0.8;
    --lb-border-radius: 3px;
    --lb-image-border: 4px solid white;
    --lb-transition-speed: 0.6s;
  }
  ```

### Recommended changes (v3.0)
- Replace PNG/GIF assets with inline SVGs.
- Replace float layout with flexbox.

---

## 6. API Design (Medium Impact)

### Issues

- **Singleton instantiation.** The module returns `new Lightbox()`, so there's only ever one instance. This makes it impossible to have two independently configured lightboxes on the same page.
- **No public API for programmatic control.** There's no way to open the lightbox from JS (`lightbox.open(url)`), go to a specific image, or close it programmatically beyond hacking internal state.
- **No events.** The library doesn't emit events (open, close, imageChange). This makes integration with other components (analytics, routing, etc.) impossible without monkey-patching.
- **No `destroy()` method.** Once initialized, the lightbox DOM and event listeners persist forever. This is a problem in SPA contexts where the component tree changes.
- **Options are set once at construction.** There's no way to change options after initialization in a clean way (the `option()` method exists but is internal and undocumented).

### Recommended changes (v2.x safe)
- Expose `open(imageUrl, options)`, `close()`, `next()`, `prev()`, `destroy()` as public methods.
- Add event emission for `lightbox:open`, `lightbox:close`, `lightbox:change` via jQuery custom events on the lightbox element.

### Recommended changes (v3.0)
- Export the constructor/class rather than an instance. Let users create multiple instances.
- Implement a proper EventEmitter or use `EventTarget`.

---

## 7. Performance (Low-Medium Impact)

### Issues

- **Repeated jQuery lookups.** Methods like `updateNav()` and `updateDetails()` repeatedly call `this.$lightbox.find(...)` for the same elements. These should be cached in `build()` alongside the existing cached references.
- **jQuery animations instead of CSS transitions.** `fadeIn()`, `fadeOut()`, and `animate()` use jQuery's JS-based animation engine, which is slower than CSS transitions/animations. CSS transitions get GPU acceleration and don't block the main thread.
- **No `will-change` hints.** The lightbox container animates width/height, but no `will-change` is set, so the browser can't optimize.
- **`sizeOverlay()` runs on every `resize` event.** No debounce/throttle.

### Recommended changes (v2.x safe)
- Cache all repeated `find()` results in `build()`.
- Debounce the window resize handler (100-200ms).

### Recommended changes (v3.0)
- Replace jQuery animations with CSS transitions and class toggles.

---

## 8. Drop jQuery (v3.0 — High Impact)

### Rationale
jQuery was essential in 2012 for cross-browser compatibility. Today, all of Lightbox2's jQuery usage maps directly to native APIs:

| jQuery | Native equivalent |
|--------|-------------------|
| `$(selector)` | `document.querySelectorAll()` |
| `$.extend()` | `Object.assign()` / spread |
| `$el.on()` | `el.addEventListener()` |
| `$el.off()` | `el.removeEventListener()` |
| `$el.fadeIn()` | CSS transitions + class toggle |
| `$el.animate()` | CSS transitions or Web Animations API |
| `$el.css()` | `el.style.property` |
| `$el.width()` | `el.offsetWidth` / `el.getBoundingClientRect()` |
| `$(document).ready()` | `DOMContentLoaded` or `defer` script |
| `$.proxy()` | `Function.prototype.bind()` |

Dropping jQuery would:
- Eliminate the 30KB+ (minified) dependency
- Make the library usable without any dependency management
- Reduce the bundled file from ~120KB to ~5KB

---

## 9. Testing (v3.0 — High Impact)

### Current state
Zero tests. `grunt test` only runs linters.

### What to test
Given the library's surface area, a focused test suite covering these scenarios would catch most regressions:

- **Album building**: Single image, grouped set via `data-lightbox`, grouped set via `rel`, mixed
- **Navigation**: Forward, backward, wrap-around on/off, keyboard nav, first/last boundary
- **Image sizing**: Viewport fitting, maxWidth/maxHeight, SVG scaling, aspect ratio preservation
- **Options**: Each option behaves as documented
- **Open/close lifecycle**: Focus management, scroll locking, event listener cleanup
- **Error handling**: 404 image, missing `href`
- **Edge cases**: Special characters in `data-lightbox`, single-image galleries, rapid clicking

### Recommended approach
- Use a lightweight DOM-capable test runner (e.g., Vitest with jsdom, or Playwright for real-browser tests).
- Start with the bugs identified in Section 3 as the first test cases — write a failing test, then fix the bug.

---

## 10. Minor Code Quality Issues

- **`void 0` for `undefined` (line 33).** A CoffeeScript-ism. Just use `undefined` or don't initialize.
- **`i = ++i` in loops (lines 238, 251).** `i++` is clearer and standard. `i = ++i` is technically fine but looks like a bug.
- **`return false` in click handlers.** This calls both `preventDefault()` and `stopPropagation()`. Usually only `preventDefault()` is intended. Stopping propagation can break other event listeners.
- **Inconsistent `var self = this` vs `.bind()`**. The code mixes both patterns. Pick one for consistency.
- **The `option()` method uses `$.extend` for a shallow merge.** With nested option objects this would overwrite sub-objects entirely rather than merging them. Not an issue with the current flat options, but fragile.

---

## Priority Order for Implementation

If tackling these in order of impact-to-effort ratio:

### Quick wins (1-2 hours each, v2.x safe)
1. Fix resize handler memory leak (Section 3)
2. Fix `.lb-prevLink`/`.lb-nextLink` dead selectors (Section 3)
3. Add `preloader.onerror` handling (Section 3)
4. Fix SVG query string detection (Section 3)
5. Cancel pending image loads on rapid navigation (Section 3)
6. Cache repeated jQuery `.find()` calls (Section 7)

### Medium effort (half-day each, v2.x safe)
7. Add focus trap and focus restoration for accessibility (Section 1)
8. Add ARIA attributes (`role="dialog"`, `aria-modal`, etc.) (Section 1)
9. Default `sanitizeTitle` to `true` (Section 2)
10. Fix selector injection with `.filter()` (Section 2)
11. Switch overlay to `position: fixed` and remove `sizeOverlay()` (Section 5)
12. Expose public API methods and events (Section 6)

### Larger efforts (v3.0)
13. Replace Grunt/Bower/JSHint/JSCS with modern tooling (Section 4)
14. Add CSS custom properties for theming (Section 5)
15. Drop jQuery dependency (Section 8)
16. Add test suite (Section 9)
17. Replace image assets with inline SVGs (Section 5)
