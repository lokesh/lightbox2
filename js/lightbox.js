(function() {
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
  
  */  var $, Lightbox, LightboxOptions;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $ = jQuery;
  LightboxOptions = (function() {
    function LightboxOptions() {
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
      return $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox]', __bind(function(e) {
        this.start($(e.currentTarget));
        return false;
      }, this));
    };
    Lightbox.prototype.build = function() {
      var $lightbox;
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
      })))), $('<div/>', {
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
      })))))).appendTo($('body'));
      $('#lightboxOverlay').hide().on('click', __bind(function(e) {
        this.end();
        return false;
      }, this));
      $lightbox = $('#lightbox');
      $lightbox.hide().on('click', __bind(function(e) {
        if ($(e.target).attr('id') === 'lightbox') {
          this.end();
        }
        return false;
      }, this));
      $lightbox.find('.lb-outerContainer').on('click', __bind(function(e) {
        if ($(e.target).attr('id') === 'lightbox') {
          this.end();
        }
        return false;
      }, this));
      $lightbox.find('.lb-prev').on('click', __bind(function(e) {
        this.changeImage(this.currentImageIndex - 1);
        return false;
      }, this));
      $lightbox.find('.lb-next').on('click', __bind(function(e) {
        this.changeImage(this.currentImageIndex + 1);
        return false;
      }, this));
      $lightbox.find('.lb-loader, .lb-close').on('click', __bind(function(e) {
        this.end();
        return false;
      }, this));
    };
    Lightbox.prototype.start = function($link) {
      var $lightbox, $window, a, i, imageNumber, left, top, _len, _ref;
      $('select, object, embed').css({
        visibility: "hidden"
      });
      $('#lightboxOverlay').fadeIn(this.options.fadeDuration);
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
          if ($(a).attr('href') === $link.attr('href')) {
            imageNumber = i;
          }
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
      var $image, $lightbox, preloader;
      this.disableKeyboardNav();
      $lightbox = $('#lightbox');
      $image = $lightbox.find('.lb-image');
      $('#lightboxOverlay').fadeIn(this.options.fadeDuration);
      $('.loader').fadeIn('slow');
      $lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();
      $lightbox.find('.lb-outerContainer').addClass('animating');
      preloader = new Image;
      preloader.onload = __bind(function() {
        $image.attr('src', this.album[imageNumber].link);
        $image.width = preloader.width;
        $image.height = preloader.height;
        return this.sizeContainer(preloader.width, preloader.height);
      }, this);
      preloader.src = this.album[imageNumber].link;
      this.currentImageIndex = imageNumber;
    };
    Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
      var $container, $lightbox, $outerContainer, containerBottomPadding, containerLeftPadding, containerRightPadding, containerTopPadding, newHeight, newWidth, oldHeight, oldWidth;
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
      setTimeout(__bind(function() {
        $lightbox.find('.lb-dataContainer').width(newWidth);
        $lightbox.find('.lb-prevLink').height(newHeight);
        $lightbox.find('.lb-nextLink').height(newHeight);
        this.showImage();
      }, this), this.options.resizeDuration);
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
      if (this.currentImageIndex > 0) {
        $lightbox.find('.lb-prev').show();
        if (this.currentImageIndex < this.album.length - 1) {
          $lightbox.find('.lb-next').show();
        }
      }
    };
    Lightbox.prototype.updateDetails = function() {
      var $lightbox;
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
      $lightbox.find('.lb-dataContainer').fadeIn(this.resizeDuration);
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
