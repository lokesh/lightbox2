# Lightbox2

The original lightbox script. Eight years later — still going strong!

For demos and usage instructions, visit [lokeshdhakar.com/projects/lightbox2/](http://lokeshdhakar.com/projects/lightbox2/).

by [Lokesh Dhakar](http://www.lokeshdhakar.com)  


## License

<span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/Text" property="dct:title" rel="dct:type">lightbox2</span> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.

- **100% Free.** Lightbox is free to use in both personal and commercial work.
- **Attribution is required.** This means, leaving the author name, author homepage link, and the license info intact. None of these items have to be user-facing and can remain alongside the code.


## Roadmap

- **Maintenance.** No substantial additions are being worked on till all open Pull Requests and Issues have been reviewed.

## Changelog

### 2.7.2 - UNRELEASED

- [Add] maxWidth and maxHeight options added [#197](https://github.com/lokesh/lightbox2/pull/197)
- [Add] Enable target attribute in caption links [#299](https://github.com/lokesh/lightbox2/pull/299)
- [Change] Add lightbox.css to bower.json main property
- [Change] Dropped version property from bower.json. [#453](https://github.com/lokesh/lightbox2/pull/453)
- [Fix] Remove empty src attribute from img tag [#287](https://github.com/lokesh/lightbox2/pull/287)
- [Fix] Correct grammatical error in comment [#224](https://github.com/lokesh/lightbox2/pull/224)
- [Fix] Clear the jquery animation queue before hiding the .lb-loader [#309](https://github.com/lokesh/lightbox2/pull/309)

### v2.7.1 - 2014-30-03

- [Fix] Enable links in captions

### v2.7.0 - 2014-29-03

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