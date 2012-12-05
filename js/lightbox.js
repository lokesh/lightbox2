
/*
Lightbox v2.51
by Lokesh Dhakar - http://www.lokeshdhakar.com

For more information, visit:
http://lokeshdhakar.com/projects/lightbox2/

Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
- free for use in both personal and commercial projects
- attribution requires leaving author name, author link, and the license info intact
	
Thanks
- Scott Upton(uptonic.com), Peter-Paul Koch(quirksmode.com), and Thomas Fuchs(mir.aculo.us) for ideas, libs, and snippets.
- Artemy Tregubenko (arty.name) for cleanup and help in updating to latest proto-aculous in v2.05.


Table of Contents
=================
LightboxOptions

Lightbox
- constructor
- init
- enable
- build
- start
- changeImage
- sizeContainer
- showImage
- updateNav
- updateDetails
- preloadNeigbhoringImages
- enableKeyboardNav
- disableKeyboardNav
- keyboardAction
- end

options = new LightboxOptions
lightbox = new Lightbox options
*/

(function() {
  var $, Lightbox, LightboxOptions;

  $ = jQuery;

  LightboxOptions = (function() {

    function LightboxOptions() {
      this.fileLoadingImage = 'data:image/gif;base64,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';
      this.fileCloseImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAABuUlEQVR42p1WMY6DMBDkJVcdRZDyhpx0TX5AoggqOgQFNS3V3TfykBRpEzl5RE4n3Ru4HckrgY29xpZGlvF4Bw/Yu4nRMsKX7oPaOI4WqL0Tvgm7yXNL6IH1us8ixDjOXcf5I3yaYilBgXA4HEb0epyuEJvFOR6PHOeX8MFiGeGJibIsx/P5jJ6JeL4JEQPPjNO2Lcf5gaUgXfHgdDqBwMCYicpj6dQ6tRSnaRqO8wLxwm9ioiiKEEvZOvAX49R1zTGSjMSeCyTZUts610vP1qa0fWWQXJZuWMiwzrUWnNT89bFDCEqW3gh79D7rAMRDXOuc8dtiy4IgA2PROtehDrK067pxu92iD7JOEJMt7fs+1DpZTLZUtm4JUnvL81zxTnw7BQ98BI0WI6iqqrximAcvQsw+sMMweMUwTzwgyka+62BPyPcCjwWlH0S+62zId6kkJt918q/vtJSblSY8h/pGh3qPXrhLTUtXWYe52UWM8RpL0bKYNDERXJWeLqFpwhCKSU/J1bcjmpPKgtD09PJlapBWFTzgO8oCXfA4rMA4ppTDOqPg4VLOSisPbV1skcpx7rqUmxWp//cDxLp5KHl1AAAAAElFTkSuQmCC';
      this.resizeDuration = 700;
      this.fadeDuration = 500;
      this.labelImage = "Image";
      this.labelOf = "of";
    }

    return LightboxOptions;

  })();

  Lightbox = (function() {

    function Lightbox(options) {
      this.options = options;
      this.album = [];
      this.currentImageIndex = void 0;
      this.init();
    }

    Lightbox.prototype.init = function() {
      this.enable();
      return this.build();
    };

    Lightbox.prototype.enable = function() {
      var _this = this;
      return $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox]', function(e) {
        _this.start($(e.currentTarget));
        return false;
      });
    };

    Lightbox.prototype.build = function() {
      var $lightbox,
        _this = this;
      $("<div>", {
        id: 'lightboxOverlay'
      }).after($('<div/>', {
        id: 'lightbox'
      }).append($('<div/>', {
        "class": 'lb-outerContainer'
      }).append($('<div/>', {
        "class": 'lb-container'
      }).append($('<img/>', {
        "class": 'lb-image'
      }), $('<div/>', {
        "class": 'lb-nav'
      }).append($('<a/>', {
        "class": 'lb-prev'
      }), $('<a/>', {
        "class": 'lb-next'
      })), $('<div/>', {
        "class": 'lb-loader'
      }).append($('<a/>', {
        "class": 'lb-cancel'
      }).append($('<img/>', {
        src: this.options.fileLoadingImage
      }))))), $('<div/>', {
        "class": 'lb-dataContainer'
      }).append($('<div/>', {
        "class": 'lb-data'
      }).append($('<div/>', {
        "class": 'lb-details'
      }).append($('<span/>', {
        "class": 'lb-caption'
      }), $('<span/>', {
        "class": 'lb-number'
      })), $('<div/>', {
        "class": 'lb-closeContainer'
      }).append($('<a/>', {
        "class": 'lb-close'
      }).append($('<img/>', {
        src: this.options.fileCloseImage
      }))))))).appendTo($('body'));
      $('#lightboxOverlay').hide().on('click', function(e) {
        _this.end();
        return false;
      });
      $lightbox = $('#lightbox');
      $lightbox.hide().on('click', function(e) {
        if ($(e.target).attr('id') === 'lightbox') _this.end();
        return false;
      });
      $lightbox.find('.lb-outerContainer').on('click', function(e) {
        if ($(e.target).attr('id') === 'lightbox') _this.end();
        return false;
      });
      $lightbox.find('.lb-prev').on('click', function(e) {
        _this.changeImage(_this.currentImageIndex - 1);
        return false;
      });
      $lightbox.find('.lb-next').on('click', function(e) {
        _this.changeImage(_this.currentImageIndex + 1);
        return false;
      });
      $lightbox.find('.lb-loader, .lb-close').on('click', function(e) {
        _this.end();
        return false;
      });
    };

    Lightbox.prototype.start = function($link) {
      var $lightbox, $window, a, i, imageNumber, left, top, _len, _ref;
      $(window).on("resize", this.sizeOverlay);
      $('select, object, embed').css({
        visibility: "hidden"
      });
      $('#lightboxOverlay').width($(document).width()).height($(document).height()).fadeIn(this.options.fadeDuration);
      this.album = [];
      imageNumber = 0;
      if ($link.attr('rel') === 'lightbox') {
        this.album.push({
          link: $link.attr('href'),
          title: $link.attr('title')
        });
      } else {
        _ref = $($link.prop("tagName") + '[rel="' + $link.attr('rel') + '"]');
        for (i = 0, _len = _ref.length; i < _len; i++) {
          a = _ref[i];
          this.album.push({
            link: $(a).attr('href'),
            title: $(a).attr('title')
          });
          if ($(a).attr('href') === $link.attr('href')) imageNumber = i;
        }
      }
      $window = $(window);
      top = $window.scrollTop() + $window.height() / 10;
      left = $window.scrollLeft();
      $lightbox = $('#lightbox');
      $lightbox.css({
        top: top + 'px',
        left: left + 'px'
      }).fadeIn(this.options.fadeDuration);
      this.changeImage(imageNumber);
    };

    Lightbox.prototype.changeImage = function(imageNumber) {
      var $image, $lightbox, preloader,
        _this = this;
      this.disableKeyboardNav();
      $lightbox = $('#lightbox');
      $image = $lightbox.find('.lb-image');
      this.sizeOverlay();
      $('#lightboxOverlay').fadeIn(this.options.fadeDuration);
      $('.loader').fadeIn('slow');
      $lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();
      $lightbox.find('.lb-outerContainer').addClass('animating');
      preloader = new Image;
      preloader.onload = function() {
        $image.attr('src', _this.album[imageNumber].link);
        $image.width = preloader.width;
        $image.height = preloader.height;
        return _this.sizeContainer(preloader.width, preloader.height);
      };
      preloader.src = this.album[imageNumber].link;
      this.currentImageIndex = imageNumber;
    };

    Lightbox.prototype.sizeOverlay = function() {
      return $('#lightboxOverlay').width($(document).width()).height($(document).height());
    };

    Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
      var $container, $lightbox, $outerContainer, containerBottomPadding, containerLeftPadding, containerRightPadding, containerTopPadding, newHeight, newWidth, oldHeight, oldWidth,
        _this = this;
      $lightbox = $('#lightbox');
      $outerContainer = $lightbox.find('.lb-outerContainer');
      oldWidth = $outerContainer.outerWidth();
      oldHeight = $outerContainer.outerHeight();
      $container = $lightbox.find('.lb-container');
      containerTopPadding = parseInt($container.css('padding-top'), 10);
      containerRightPadding = parseInt($container.css('padding-right'), 10);
      containerBottomPadding = parseInt($container.css('padding-bottom'), 10);
      containerLeftPadding = parseInt($container.css('padding-left'), 10);
      newWidth = imageWidth + containerLeftPadding + containerRightPadding;
      newHeight = imageHeight + containerTopPadding + containerBottomPadding;
      if (newWidth !== oldWidth && newHeight !== oldHeight) {
        $outerContainer.animate({
          width: newWidth,
          height: newHeight
        }, this.options.resizeDuration, 'swing');
      } else if (newWidth !== oldWidth) {
        $outerContainer.animate({
          width: newWidth
        }, this.options.resizeDuration, 'swing');
      } else if (newHeight !== oldHeight) {
        $outerContainer.animate({
          height: newHeight
        }, this.options.resizeDuration, 'swing');
      }
      setTimeout(function() {
        $lightbox.find('.lb-dataContainer').width(newWidth);
        $lightbox.find('.lb-prevLink').height(newHeight);
        $lightbox.find('.lb-nextLink').height(newHeight);
        _this.showImage();
      }, this.options.resizeDuration);
    };

    Lightbox.prototype.showImage = function() {
      var $lightbox;
      $lightbox = $('#lightbox');
      $lightbox.find('.lb-loader').hide();
      $lightbox.find('.lb-image').fadeIn('slow');
      this.updateNav();
      this.updateDetails();
      this.preloadNeighboringImages();
      this.enableKeyboardNav();
    };

    Lightbox.prototype.updateNav = function() {
      var $lightbox;
      $lightbox = $('#lightbox');
      $lightbox.find('.lb-nav').show();
      if (this.currentImageIndex > 0) $lightbox.find('.lb-prev').show();
      if (this.currentImageIndex < this.album.length - 1) {
        $lightbox.find('.lb-next').show();
      }
    };

    Lightbox.prototype.updateDetails = function() {
      var $lightbox,
        _this = this;
      $lightbox = $('#lightbox');
      if (typeof this.album[this.currentImageIndex].title !== 'undefined' && this.album[this.currentImageIndex].title !== "") {
        $lightbox.find('.lb-caption').html(this.album[this.currentImageIndex].title).fadeIn('fast');
      }
      if (this.album.length > 1) {
        $lightbox.find('.lb-number').html(this.options.labelImage + ' ' + (this.currentImageIndex + 1) + ' ' + this.options.labelOf + '  ' + this.album.length).fadeIn('fast');
      } else {
        $lightbox.find('.lb-number').hide();
      }
      $lightbox.find('.lb-outerContainer').removeClass('animating');
      $lightbox.find('.lb-dataContainer').fadeIn(this.resizeDuration, function() {
        return _this.sizeOverlay();
      });
    };

    Lightbox.prototype.preloadNeighboringImages = function() {
      var preloadNext, preloadPrev;
      if (this.album.length > this.currentImageIndex + 1) {
        preloadNext = new Image;
        preloadNext.src = this.album[this.currentImageIndex + 1].link;
      }
      if (this.currentImageIndex > 0) {
        preloadPrev = new Image;
        preloadPrev.src = this.album[this.currentImageIndex - 1].link;
      }
    };

    Lightbox.prototype.enableKeyboardNav = function() {
      $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
    };

    Lightbox.prototype.disableKeyboardNav = function() {
      $(document).off('.keyboard');
    };

    Lightbox.prototype.keyboardAction = function(event) {
      var KEYCODE_ESC, KEYCODE_LEFTARROW, KEYCODE_RIGHTARROW, key, keycode;
      KEYCODE_ESC = 27;
      KEYCODE_LEFTARROW = 37;
      KEYCODE_RIGHTARROW = 39;
      keycode = event.keyCode;
      key = String.fromCharCode(keycode).toLowerCase();
      if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
        this.end();
      } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
        if (this.currentImageIndex !== 0) {
          this.changeImage(this.currentImageIndex - 1);
        }
      } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
        if (this.currentImageIndex !== this.album.length - 1) {
          this.changeImage(this.currentImageIndex + 1);
        }
      }
    };

    Lightbox.prototype.end = function() {
      this.disableKeyboardNav();
      $(window).off("resize", this.sizeOverlay);
      $('#lightbox').fadeOut(this.options.fadeDuration);
      $('#lightboxOverlay').fadeOut(this.options.fadeDuration);
      return $('select, object, embed').css({
        visibility: "visible"
      });
    };

    return Lightbox;

  })();

  $(function() {
    var lightbox, options;
    options = new LightboxOptions;
    return lightbox = new Lightbox(options);
  });

}).call(this);
