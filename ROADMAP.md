# Roadmap

## v2.x - Maintenance Mode

No new features are being worked on for v2.x.

## v3.0 - In Brainstorming Phase

**Not planned for v3.0**
The goal of this script from it's beginnings till today is to to provide a better *image viewing experience*.

- **HTML or video content.**  If you need to show html or video content, I recommend googling for an alternative script as there are many options.
- **Social sharing buttons.**

**Interactions**
- Add touch gesture support.
- Exploring using tilt gesture on mobile devices with extra-wide images.
- If user attempts to go forward when at end of image set, animation (shake?) indicating the end or option to close Lightbox.
- Make sure right-click/long pressing works to access the image's context menu.

**Layout**
- Allow vertical centering.
- Update sizing on window resize.
- Should the dev be able to choose the position of the caption, close button, and nav controls?
- Optimize layout for mobile.
- Optimize layout for screens of varying densities.
- Should the close button still live in the bottom right corner?

**Animations**
- Evaluate start, end, and transition animations.
- Rewrite animations for performance and flexibility.

**Assets**
- Use inline SVG for UI elements.

**Caching**
- Review if and how images should be preloaded

**Accessibility**
- Should opening lightbox update the url? and should this url be parsed on page load to show Lightbox automatically?
- Review alt attributes.
- Review ARIA roles.
- Review constrast ratios.
- Review keyboard input and tabbing.
- Review click/touch target size.
- Test with screen reader.

**API**
- Do not initialize automatically and allow multiple instances.
- Add event handlers.
- Allow setting options on the fly.
- Allow the setting of options from HTML?
- Allow instantiation with jQuery plugin syntax.
- Evaluate preloading and caching.
- Evaluate droppping jQuery requirement.
- Allow placement inside of a specified element? Orig feature requester was dealing with iframe.
