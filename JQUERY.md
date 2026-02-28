# Plan: Remove jQuery Dependency from Lightbox2 Core

## Context

Lightbox2 currently requires jQuery (30KB+ minified) for DOM manipulation, event handling, and animations. The entire jQuery API surface used by the library maps to well-supported native browser APIs. Removing this dependency lets developers use Lightbox2 without jQuery while keeping backwards compatibility via the existing `lightbox-plus-jquery` bundle.

**Not a breaking change** — the public API (`open`, `close`, `next`, `prev`, `destroy`, `option`) stays identical. The `lightbox:open`/`lightbox:close`/`lightbox:change` events switch from jQuery triggers to native `CustomEvent` — acceptable since they were just added in 2.12.0.

**Decisions made:**
- Keep UMD module format (no jQuery in wrapper)
- CSS transitions + class toggles for all animations
- `lightbox-plus-jquery.js` bundle just concatenates jQuery before vanilla lightbox
- `start()` accepts both native elements and jQuery-wrapped elements

## Files to Modify

| File | Change |
|------|--------|
| `src/css/lightbox.css` | Add transition rules, `.lb-visible` pattern, duration custom properties |
| `src/js/lightbox.js` | Rewrite all jQuery usage to vanilla DOM APIs |
| `package.json` | Move jquery to devDependencies, update description |
| `eslint.config.js` | Bump ecmaVersion to 6, remove jQuery globals, add CustomEvent/getComputedStyle/Object globals |
| `examples/index.html` | Add standalone (no-jQuery) usage example |

---

## Phase 0: Config Updates

### `eslint.config.js`
- Change `ecmaVersion: 5` → `ecmaVersion: 6`
- Remove `$: 'readonly'` and `jQuery: 'readonly'` from globals
- Add `CustomEvent: 'readonly'`, `getComputedStyle: 'readonly'`, `Object: 'readonly'` to globals

### `package.json`
- Move `"jquery": "^3.7.1"` from `dependencies` to `devDependencies`
- Update description: remove "Uses jQuery."

---

## Phase 1: CSS Transition Infrastructure

Add to `:root` block:
```css
--lb-fade-duration: 600ms;
--lb-image-fade-duration: 600ms;
--lb-resize-duration: 700ms;
```

Add CSS transitions and `.lb-visible` pattern for each animated element:

| Element | Transition property | `.lb-visible` opacity target |
|---------|-------------------|------------------------------|
| `.lightboxOverlay` | `opacity var(--lb-fade-duration) ease` | `var(--lb-overlay-opacity)` |
| `.lightbox` | `opacity var(--lb-fade-duration) ease` | `1` |
| `.lb-image` | `opacity var(--lb-image-fade-duration) ease` | `1` |
| `.lb-outerContainer` | `width var(--lb-resize-duration) ease, height var(--lb-resize-duration) ease` | N/A (size transition, not opacity) |
| `.lb-dataContainer` | `opacity var(--lb-resize-duration) ease` | `1` |
| `.lb-caption` | `opacity 200ms ease` | `1` |
| `.lb-number` | `opacity 200ms ease` | `1` |
| `.lb-loader` | `opacity 600ms ease` | `1` |

Each element gets `opacity: 0` as default state. Elements that use `display: none` keep it — the JS `fadeIn` helper handles the display→reflow→class sequence.

---

## Phase 2: JS Utility Helpers and UMD Wrapper

### New UMD wrapper (no jQuery dependency)
```js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.lightbox = factory();
    }
}(this, function () {
```

### Internal utility functions (module-scoped)

- **`fadeIn(el, duration, callback)`** — Set `display: ''`, force reflow, add `.lb-visible`. Optional `transitionend` callback.
- **`fadeOut(el, duration, callback)`** — Remove `.lb-visible`, on `transitionend` set `display: none`.
- **`hideEl(el)`** — Immediately hide (removes class + `display: none`), cancels any pending transition handler. Replaces jQuery's `.stop(true).hide()` and `.hide()`.
- **`showEl(el)`** — Immediately show (sets `display: ''` + adds `.lb-visible`). Replaces jQuery's `.show()`.

---

## Phase 3: DOM Construction and Element Caching (build method)

### Property renames (throughout entire file)
`this.$lightbox` → `this.lightbox`, `this.$overlay` → `this.overlay`, etc. Drop the `$` prefix on all 14 cached element properties.

### Key conversions in `build()`
- `$('#lightbox').length > 0` → `document.getElementById('lightbox')`
- `$('<html>').appendTo($('body'))` → `document.body.insertAdjacentHTML('beforeend', html)`
- `$('#id')` → `document.getElementById('id')`
- `.find('.class')` → `.querySelector('.class')`
- `.css('padding-top')` → `getComputedStyle(el).paddingTop`
- `.hide().on('click', fn)` → `el.style.display = 'none'; el.addEventListener('click', fn)`
- `$(event.target).attr('id')` → `event.target.id`
- `.one('contextmenu', fn)` → `addEventListener('contextmenu', fn, { once: true })` (or manual named-fn removal for broader compat)
- `.add($other).on('click keyup', fn)` → separate `addEventListener` calls on each element for each event type

### CSS computed values sync
After element caching, sync JS option durations to CSS custom properties:
```js
var root = document.documentElement;
root.style.setProperty('--lb-fade-duration', this.options.fadeDuration + 'ms');
root.style.setProperty('--lb-image-fade-duration', this.options.imageFadeDuration + 'ms');
root.style.setProperty('--lb-resize-duration', this.options.resizeDuration + 'ms');
```

Also update `option()` to sync durations when they change at runtime.

---

## Phase 4: Event Delegation, start(), Album Logic, Public API

### `init()` — DOMContentLoaded
```js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { ... });
} else { ... }
```

### `enable()` — Delegated click
Store bound handler ref in `this._boundClickDelegate` for cleanup in `destroy()`:
```js
document.body.addEventListener('click', function(event) {
  var target = event.target.closest('a[rel^="lightbox"], area[rel^="lightbox"], a[data-lightbox], area[data-lightbox]');
  if (target) { self.start(target); event.preventDefault(); }
});
```

### `start(link)` — Accept both native and jQuery elements
Unwrap at top: `if (link && (link.jquery || (link[0] && link[0].nodeType))) { link = link[0]; }`

Replace throughout:
- `.attr('data-lightbox')` → `.getAttribute('data-lightbox')`
- `$($link.prop('tagName')).filter(...)` → `document.querySelectorAll(tag + '[data-lightbox="' + val + '"]')`
- `$.proxy(fn, this)` → `fn.bind(this)` — store as `this._boundTrapFocus`
- `$(document).trigger('lightbox:open', [...])` → `document.dispatchEvent(new CustomEvent('lightbox:open', { detail: data }))`

### `open()`, `destroy()` — Same patterns as `start()`/`end()`

---

## Phase 5: Animation Conversions

This is the largest phase. Every `.fadeIn()`, `.fadeOut()`, `.hide()`, `.show()`, `.animate()`, `.stop()` call is converted.

### `changeImage()`
- `.fadeIn(dur)` → `fadeIn(el, dur)`
- `.fadeIn('slow')` → `fadeIn(el, 600)` (jQuery 'slow' = 600ms)
- `.hide()` → `hideEl(el)`
- `.addClass()` / `.removeClass()` → `.classList.add/remove()`
- `.attr({...})` → `.setAttribute()` calls
- `.width(val)` setter → `.style.width = val + 'px'`
- `$(window).width()` → `window.innerWidth`
- Track `imageWidth`/`imageHeight` in local variables instead of reading back via getter

### `sizeContainer()` — Critical animation
Replace `$outerContainer.animate({width, height}, dur, 'swing', callback)` with:
1. CSS `transition` on `.lb-outerContainer` (already in CSS from Phase 1)
2. Set width/height via `style` properties
3. Listen for `transitionend` with a `transitionDone` flag (prevents double-fire since both width and height transition)
4. If dimensions unchanged, call `postResize()` immediately (existing logic)

### `showImage()`
- `.stop(true).hide()` → `hideEl(el)`
- `.fadeIn(dur)` → `fadeIn(el, dur)`
- Custom events → `document.dispatchEvent(new CustomEvent(...))`

### `updateNav()`
- `.show()` → `showEl(el)`
- `.css('opacity', '1')` → `el.style.opacity = '1'`

### `updateDetails()`
- `.text(str)` → `.textContent = str`
- `.html(str)` → `.innerHTML = str`
- `.fadeIn('fast')` → `fadeIn(el, 200)` (jQuery 'fast' = 200ms)

### `enableKeyboardNav()` / `disableKeyboardNav()`
Store bound handler ref in `this._boundKeyboardAction`. Use `addEventListener`/`removeEventListener` with stored reference instead of jQuery namespaces.

### `_trapFocus()`
- `.find('[tabindex]:visible').filter(fn)` → `querySelectorAll('[tabindex]')` + loop with `offsetParent` visibility check
- `.first()[0]` / `.last()[0]` → `arr[0]` / `arr[arr.length - 1]`

### `end()`
- `.off('.focustrap')` → `removeEventListener` with stored `_boundTrapFocus` ref
- `.fadeOut(dur)` → `fadeOut(el, dur)`
- `.trigger('focus')` → `.focus()`

---

## Phase 6: Build and Final Cleanup

1. Run `npm run build` — verify all dist files generated
2. Run `npm run lint` — verify no `$` references remain (caught by `no-undef`)
3. Grep source for any remaining `$` usage
4. Update examples/index.html — add standalone usage comment
5. Version bump (if desired — separate from this PR)

---

## Verification

1. `npm run lint` — passes clean
2. `npm run build` — all 8 dist files generated
3. Serve project root (`npx serve .`), open `/examples/index.html`
4. **Manual test matrix:**
   - Single image click → overlay fades in, lightbox appears, image loads and fades in
   - Image set navigation → container resizes smoothly, prev/next work
   - Caption and image number display correctly
   - Keyboard: left/right arrows navigate, Escape closes
   - Close via: X button, overlay click, lightbox background click
   - Focus trap: Tab cycles within lightbox only
   - Right-click on image: context menu appears on the image itself
   - `wrapAround` option: navigation wraps from last to first
   - Multiple galleries via `data-lightbox` grouping work independently
   - `rel="lightbox"` legacy support still works
   - Programmatic API: `lightbox.open('url')`, `lightbox.close()`, `lightbox.next()`, `lightbox.prev()`
5. Test `dist/js/lightbox.min.js` loaded WITHOUT jQuery — should work standalone
6. Test `dist/js/lightbox-plus-jquery.min.js` — should work identically (jQuery present but unused by lightbox)
