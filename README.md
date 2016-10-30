# Lightbox2

The original lightbox script. Eight years later — still going strong!

Lightbox is small javascript library used to overlay images on top of the current page. It's a snap to setup and works on all modern browsers.

For demos and usage instructions, visit [lokeshdhakar.com/projects/lightbox2/](http://lokeshdhakar.com/projects/lightbox2/).

by [Lokesh Dhakar](http://www.lokeshdhakar.com)


## Roadmap

### Actively being worked on

- **Maintenance.** Geting open Issues and PRs number down. Not working on new features for v2.x.

### Features *NOT* on the roadmap

The goal of this script from it's beginnings till today is to to provide a better *image viewing experience*.

- **HTML or video content.**  If you need to show html or video content, I recommend googling for an alternative script as there are many options.
- **Social sharing buttons.** 

### v3.0 - In Brainstorming Phase

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

## Changelog

### v2.9.0 - 2016-10-30

- [Fix] Allow loading of lightbox.js anywhere on page. Prev requirement was at the end of the body tag. [Commit](https://github.com/lokesh/lightbox2/commit/7047214f77cfc8f892e8513426b57d45bf29e9cd)
- [Add] Add imageFadeDuration option. [Commit](https://github.com/lokesh/lightbox2/commit/6d5f99a65f189a5d2bd7bbfac4682fe36e62871e)
- [Change] Right-clicking image now shows context menu for image. [Commit](https://github.com/lokesh/lightbox2/commit/363c3cb8af8fae1b6f95d6679df976022290f878)
- [Change] Allow controlling of image border with a simpler css border vs a parent container padding _hack_. [Commit](https://github.com/lokesh/lightbox2/commit/214361297f1dd5f0c19c1d80ff37c398cdda55cb)

### v2.8.2 - 2015-12-13

- [Add] npm support. ```npm install --save lightbox2```
- [Add] Add option to disable vertical scrolling [#487](https://github.com/lokesh/lightbox2/pull/487) Thanks [blacksunshineCoding](https://github.com/blacksunshineCoding)
- [Fix] When horizontal scrolling is on page the overlay is not covering entire page [#485](https://github.com/lokesh/lightbox2/pull/485) Thanks [@manuel-io](https://github.com/manuel-io)
- [Change] Add css minify task to Gruntfile.js and removedlegacy css vendor prefixes for border-radius. [#470](https://github.com/lokesh/lightbox2/pull/470) Thanks [ajerez](https://github.com/ajerez)


### v2.8.1 - 2015-07-09

- [Fix] Change AMD jQuery require statement to use all lowercase. [#464](https://github.com/lokesh/lightbox2/pull/464) Thanks [@vtforester](https://github.com/vtforester)

### v2.8.0 - 2015-06-29

- [Add] UMD support (AMD, CommonJS, fallback to global export).[#461](https://github.com/lokesh/lightbox2/pull/461)
- [Add] option method for setting options. [#461](https://github.com/lokesh/lightbox2/commit/d708fbd716aaa90e01ba4198944c8955e7283d87)
- [Add] CONTRIBUTING.md

### v2.7.4 - 2015-06-23

- [Change] Revert jquery dep version to 2.x from 1.x. Added note to Lightbox page about using jQuery 1.x to get IE6, 7, and 8 support.
- [Fix] Preserve author and license comments from lightbox.js in minified files.

### v2.7.3 - 2015-06-22

- [Add] Barebone HTML file with examples /examples/index.html.
- [Add] jquery.lightbox.js which concatenates jQuery and Lightbox. This is for those who are Bower averse or want an extra easy install.

### v2.7.2 - 2015-06-16

- [Add] maxWidth and maxHeight options added [#197](https://github.com/lokesh/lightbox2/pull/197)
- [Add] Enable target attribute in caption links [#299](https://github.com/lokesh/lightbox2/pull/299)
- [Change] Switched to The MIT License from  Creative Commons Attribution 4.0 International License.
- [Change] Add CSS and images to bower.json main property.
- [Change] Dropped version property from bower.json. [#453](https://github.com/lokesh/lightbox2/pull/453)
- [Change] Use src -> dist folder structure for build.
- [Fix] Remove empty src attribute from img tag [#287](https://github.com/lokesh/lightbox2/pull/287)
- [Fix] Correct grammatical error in comment [#224](https://github.com/lokesh/lightbox2/pull/224)
- [Fix] Clear the jquery animation queue before hiding the .lb-loader [#309](https://github.com/lokesh/lightbox2/pull/309)
- [Remove] Remove releases's zips from repo.

### v2.7.1 - 2014-03-30

- [Fix] Enable links in captions

### v2.7.0 - 2014-03-29

- [Add] Support for data-title attribute for the caption.  - Thanks [@copycut](https://github.com/copycut)
- [Add] New option to enable always visible prev and next arrows
- [Change] Rewrite Coffeescript code into plain ole Javascript
- [Change] Updated jQuery to v1.10.2
- [Fix] prev/next arrows not appearing in IE9 and IE 10 - Thanks [@rebizu](https://github.com/rebizu)
- [Fix]  Support wrap around option w/keyboard actions. Thanks [@vovayatsyuk](https://github.com/vovayatsyuk)

### v2.6.0 - 2013-07-06

- [Add] Added wraparound option
- [Add] Added fitImagesInViewport option - now mobile friendly
- [Add] Added showImageNumber label
- [Add] Compatibility with html5shiv
- [Add] Html5 valid using new data-lightbox attribute
- [Add] Compatibility with hmtl5shiv and modernizr
- [Add] Support jquery 1.9+
- [Change] Move reference to loading and close images into css
- [Change] Cache jquery objects

### v2.5.0 - 2012-04-11

- [Change] Switch to jQuery from Prototype and Scriptaculous
- [Change] Switch from Javacript to Coffeescript
- [Change] Switch from CSS to SASS
- [Add] Repo created on Github


## How to deploy

- Update version number in ```src/lightbox.js```
- Update README.md Changelog with release date
- grunt build
- Push to Github repo
- Create a new Github release along with tag. Naming convention for both ```v2.8.1```
