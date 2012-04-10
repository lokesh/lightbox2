
/*
Lightbox v2.5
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
  var Lightbox, LightboxOptions;

  LightboxOptions = (function() {

    function LightboxOptions() {
      this.fileLoadingImage = 'images/loading.gif';
      this.fileCloseImage = 'images/close.png';
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
      this.currentImageNumber = void 0;
      this.init();
    }

    Lightbox.prototype.init = function() {
      this.enable();
      return this.build();
    };

    Lightbox.prototype.enable = function() {
      var _this = this;
      return $('a[rel^=lightbox], area[rel^=lightbox]').on('click', function(e) {
        _this.start(e.currentTarget);
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
        "class": 'outerContainer'
      }).append($('<div/>', {
        "class": 'container'
      }).append($('<img/>', {
        "class": 'image'
      }), $('<div/>', {
        "class": 'nav'
      }).append($('<a/>', {
        "class": 'prev'
      }), $('<a/>', {
        "class": 'next'
      })), $('<div/>', {
        "class": 'loader'
      }).append($('<a/>', {
        "class": 'cancel'
      }).append($('<img/>', {
        src: this.options.fileLoadingImage
      }))))), $('<div/>', {
        "class": 'dataContainer'
      }).append($('<div/>', {
        "class": 'data'
      }).append($('<div/>', {
        "class": 'details'
      }).append($('<span/>', {
        "class": 'caption'
      }), $('<span/>', {
        "class": 'number'
      })), $('<div/>', {
        "class": 'closeContainer'
      }).append($('<a/>', {
        "class": 'close'
      }).append($('<img/>', {
        src: this.options.fileCloseImage
      }))))))).appendTo($('body'));
      $('#lightboxOverlay').on('click', function(e) {
        _this.end();
        return false;
      });
      $lightbox = $('#lightbox');
      $lightbox.on('click', function(e) {
        if ($(e.target).attr('id') === 'lightbox') _this.end();
        return false;
      });
      $lightbox.find('.outerContainer').on('click', function(e) {
        if ($(e.target).attr('id') === 'lightbox') _this.end();
        return false;
      });
      $lightbox.find('.prev').on('click', function(e) {
        _this.changeImage(_this.currentImageNumber - 1);
        return false;
      });
      $lightbox.find('.next').on('click', function(e) {
        _this.changeImage(_this.currentImageNumber + 1);
        return false;
      });
      $lightbox.find('.loader, .close').on('click', function(e) {
        _this.end();
        return false;
      });
    };

    Lightbox.prototype.start = function(link) {
      var $lightbox, $window, a, i, imageNumber, left, top, _len, _ref;
      $('select, object, embed').css({
        visibility: "hidden"
      });
      $('#lightboxOverlay').width($(document).width()).height($(document).height()).fadeIn(this.options.fadeDuration);
      this.album = [];
      imageNumber = 0;
      if (link.rel === 'lightbox') {
        this.album.push({
          link: link.href,
          title: link.title
        });
      } else {
        _ref = $(link.tagName + '[rel="' + link.rel + '"]');
        for (i = 0, _len = _ref.length; i < _len; i++) {
          a = _ref[i];
          this.album.push({
            link: a.href,
            title: a.title
          });
          if (a.href === link.href) imageNumber = i;
        }
      }
      $window = $(window);
      top = $window.scrollTop() + $window.height() / 10;
      left = $window.scrollLeft();
      $lightbox = $('#lightbox');
      $lightbox.fadeIn(this.options.fadeDuration).css({
        top: top + 'px',
        left: left + 'px'
      });
      this.changeImage(imageNumber);
    };

    Lightbox.prototype.changeImage = function(imageNumber) {
      var $image, $lightbox, preloader,
        _this = this;
      $lightbox = $('#lightbox');
      $image = $lightbox.find('.image');
      $('.loader').fadeIn('slow');
      $lightbox.find('.image, .nav, .prev, .next, .dataContainer, .numbers').hide();
      $lightbox.find('.outerContainer').addClass('animating');
      preloader = new Image;
      preloader.onload = function() {
        $image.attr('src', _this.album[_this.currentImageNumber].link);
        $image.width = preloader.width;
        $image.height = preloader.height;
        return _this.sizeContainer(preloader.width, preloader.height);
      };
      preloader.src = this.album[imageNumber].link;
      this.currentImageNumber = imageNumber;
    };

    Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
      var $lightbox, $outerContainer, newHeight, newWidth, oldHeight, oldWidth,
        _this = this;
      $lightbox = $('#lightbox');
      $outerContainer = $lightbox.find('.outerContainer');
      oldWidth = $outerContainer.outerWidth();
      oldHeight = $outerContainer.outerHeight();
      newWidth = imageWidth + 20;
      newHeight = imageHeight + 20;
      if (newWidth !== oldWidth && newHeight !== oldHeight) {
        $outerContainer.animate({
          width: newWidth,
          height: newHeight
        }, this.options.resizeDuration, 'easeInOutCubic');
      } else if (newWidth !== oldWidth) {
        $outerContainer.animate({
          width: newWidth
        }, this.options.resizeDuration, 'easeInOutCubic');
      } else if (newHeight !== oldHeight) {
        $outerContainer.animate({
          height: newHeight
        }, this.options.resizeDuration, 'easeInOutCubic');
      }
      setTimeout(function() {
        $lightbox.find('.dataContainer').width(newWidth);
        $lightbox.find('.prevLink').height(newHeight);
        $lightbox.find('.nextLink').height(newHeight);
        _this.showImage();
      }, this.options.resizeDuration);
    };

    Lightbox.prototype.showImage = function() {
      var $lightbox;
      $lightbox = $('#lightbox');
      $lightbox.find('.loader').hide();
      $lightbox.find('.image').fadeIn('slow');
      this.updateNav();
      this.updateDetails();
      this.preloadNeighboringImages();
      this.enableKeyboardNav();
    };

    Lightbox.prototype.updateNav = function() {
      var $lightbox;
      $lightbox = $('#lightbox');
      $lightbox.find('.nav').show();
      if (this.currentImageNumber > 0) $lightbox.find('.prev').show();
      if (this.currentImageNumber < this.album.length - 1) {
        $lightbox.find('.next').show();
      }
    };

    Lightbox.prototype.updateDetails = function() {
      var $lightbox,
        _this = this;
      $lightbox = $('#lightbox');
      $lightbox.find('.caption').html(this.album[this.currentImageNumber].title).fadeIn('fast');
      if (this.album.length > 1) {
        $lightbox.find('.number').html(this.options.labelImage + ' ' + (this.currentImageNumber + 1) + ' ' + this.options.labelOf + '  ' + this.album.length).fadeIn('fast');
      } else {
        $lightbox.find('.number').hide();
      }
      $lightbox.find('.outerContainer').removeClass('animating');
      $lightbox.find('.dataContainer').slideDown(this.resizeDuration, function() {
        return $('#lightboxOverlay').width($(document).width()).height($(document).height());
      });
    };

    Lightbox.prototype.preloadNeighboringImages = function() {
      var preloadNext, preloadPrev;
      if (this.album.length > this.currentImageNumber + 1) {
        preloadNext = new Image;
        preloadNext.src = this.album[this.currentImageNumber + 1].link;
      }
      if (this.currentImageNumber > 0) {
        preloadPrev = new Image;
        preloadPrev.src = this.album[this.currentImageNumber - 1].link;
      }
    };

    Lightbox.prototype.enableKeyboardNav = function() {
      $(document).on('keyup', $.proxy(this.keyboardAction, this));
    };

    Lightbox.prototype.disableKeyboardNav = function() {
      $(document).off('keyup', this.keyboardAction);
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
        if (this.currentImageNumber !== 0) {
          this.disableKeyboardNav();
          this.changeImage(this.currentImageNumber - 1);
        }
      } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
        if (this.currentImageNumber !== this.album.length - 1) {
          this.disableKeyboardNav();
          this.changeImage(this.currentImageNumber + 1);
        }
      }
    };

    Lightbox.prototype.end = function() {
      this.disableKeyboardNav();
      $('#lightbox').fadeOut('fast');
      $('#lightboxOverlay').fadeOut('slow');
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
