# Lightbox2

The original lightbox script. Eight years later — still going strong!

Lightbox is small javascript library used to overlay images on top of the current page. It's a snap to setup and works on all modern browsers.

For demos and usage instructions, visit [lokeshdhakar.com/projects/lightbox2/](http://lokeshdhakar.com/projects/lightbox2/).

by [Lokesh Dhakar](http://www.lokeshdhakar.com)  


## License

Lightbox2 is licensed under The MIT License.

- **100% Free.** Lightbox is free to use in both commercial and non-commercial work.
- **Attribution is required.** This means you must leave my name, my homepage link, and the license info intact. None of these items have to be user-facing and can remain alongside the code.


## Roadmap

- **Maintenance.** No substantial features are being worked on till all open Pull Requests and Issues have been reviewed.
- **Documentation.** Main features and options need to be documented.

## Changelog

### v2.7.3 - UNRELEASED

- [Add] Barebone HTML file with examples /examples/index.html.
- [Add] jquery.lightbox.js which concatenates jQuery and Lightbox. This is for those who are Bower averse or want an extra easy install.
- [ ] Document options.
- [ ] Add usage info to README.
- [ ] Add module compatibility (AMD, etc).

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

- [Add] Support for data-title attribute for the caption - Thanks https://github.com/copycut
- [Add] New option to enable always visible prev and next arrows
- [Change] Rewrite Coffeescript code into plain ole Javascript
- [Change] Updated jQuery to v1.10.2
- [Fix] prev/next arrows not appearing in IE9 and IE 10 - Thanks https://github.com/rebizu
- [Fix]  Support wrap around option w/keyboard actions. Thanks https://github.com/vovayatsyuk

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