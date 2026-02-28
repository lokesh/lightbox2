/*!
 * Lightbox v2.12.0
 * by Lokesh Dhakar
 *
 * More info:
 * http://lokeshdhakar.com/projects/lightbox2/
 *
 * Copyright Lokesh Dhakar
 * Released under the MIT license
 * https://github.com/lokesh/lightbox2/blob/master/LICENSE
 *
 * @preserve
 */

// Uses Node, AMD or browser globals to create a module.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.lightbox = factory(root.jQuery);
    }
}(this, function ($) {

  function Lightbox(options) {
    this.album = [];
    this.currentImageIndex = undefined;
    this._preloader = null;
    this._sizeOverlayProxy = null;
    this.$triggerElement = null;
    this.init();

    // options
    this.options = $.extend({}, this.constructor.defaults);
    this.option(options);
  }

  // Descriptions of all options available on the demo site:
  // http://lokeshdhakar.com/projects/lightbox2/index.html#options
  Lightbox.defaults = {
    albumLabel: 'Image %1 of %2',
    alwaysShowNavOnTouchDevices: false,
    fadeDuration: 600,
    fitImagesInViewport: true,
    imageFadeDuration: 600,
    // maxWidth: 800,
    // maxHeight: 600,
    positionFromTop: 50,
    resizeDuration: 700,
    showImageNumberLabel: true,
    wrapAround: false,
    disableScrolling: false,
    /*
    Sanitize Title
    If the caption data is trusted, for example you are hardcoding it in, then leave this to false.
    This will free you to add html tags, such as links, in the caption.

    If the caption data is user submitted or from some other untrusted source, then set this to true
    to prevent xss and other injection attacks.
     */
    sanitizeTitle: false
  };

  Lightbox.prototype.option = function(options) {
    $.extend(this.options, options);
  };

  Lightbox.prototype.imageCountLabel = function(currentImageNum, totalImages) {
    return this.options.albumLabel.replace(/%1/g, currentImageNum).replace(/%2/g, totalImages);
  };

  Lightbox.prototype.init = function() {
    var self = this;
    // Both enable and build methods require the body tag to be in the DOM.
    $(document).ready(function() {
      self.enable();
      self.build();
    });
  };

  // Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
  // that contain 'lightbox'. When these are clicked, start lightbox.
  Lightbox.prototype.enable = function() {
    var self = this;
    $('body').on('click.lightbox', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', function(event) {
      self.start($(event.currentTarget));
      return false;
    });
  };

  // Build html for the lightbox and the overlay.
  // Attach event handlers to the new DOM elements. click click click
  Lightbox.prototype.build = function() {
    if ($('#lightbox').length > 0) {
        return;
    }

    var self = this;

    // The two root notes generated, #lightboxOverlay and #lightbox are given
    // tabindex attrs so they are focusable. We attach our keyboard event
    // listeners to these two elements, and not the document. Clicking anywhere
    // while Lightbox is opened will keep the focus on or inside one of these
    // two elements.
    //
    // We do this so we can prevent propagation of the Esc keypress when
    // Lightbox is open. This prevents it from interfering with other components
    // on the page below.
    //
    // Github issue: https://github.com/lokesh/lightbox2/issues/663
    $('<div id="lightboxOverlay" tabindex="-1" class="lightboxOverlay"></div><div id="lightbox" tabindex="-1" class="lightbox" role="dialog" aria-modal="true" aria-label="Image lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" alt="" aria-describedby="lb-caption"/><div class="lb-nav"><a class="lb-prev" role="button" tabindex="0" aria-label="Previous image"></a><a class="lb-next" role="button" tabindex="0" aria-label="Next image"></a></div><div class="lb-loader"><a class="lb-cancel" role="button" tabindex="0"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span id="lb-caption" class="lb-caption"></span><span class="lb-number" aria-live="polite"></span></div><div class="lb-closeContainer"><a class="lb-close" role="button" tabindex="0"></a></div></div></div></div>').appendTo($('body'));

    // Cache jQuery objects
    this.$lightbox       = $('#lightbox');
    this.$overlay        = $('#lightboxOverlay');
    this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
    this.$container      = this.$lightbox.find('.lb-container');
    this.$image          = this.$lightbox.find('.lb-image');
    this.$nav            = this.$lightbox.find('.lb-nav');
    this.$prev           = this.$lightbox.find('.lb-prev');
    this.$next           = this.$lightbox.find('.lb-next');
    this.$loader         = this.$lightbox.find('.lb-loader');
    this.$dataContainer  = this.$lightbox.find('.lb-dataContainer');
    this.$caption        = this.$lightbox.find('.lb-caption');
    this.$number         = this.$lightbox.find('.lb-number');
    this.$close          = this.$lightbox.find('.lb-close');

    // Store css values for future lookup
    this.containerPadding = {
      top: parseInt(this.$container.css('padding-top'), 10),
      right: parseInt(this.$container.css('padding-right'), 10),
      bottom: parseInt(this.$container.css('padding-bottom'), 10),
      left: parseInt(this.$container.css('padding-left'), 10)
    };

    this.imageBorderWidth = {
      top: parseInt(this.$image.css('border-top-width'), 10),
      right: parseInt(this.$image.css('border-right-width'), 10),
      bottom: parseInt(this.$image.css('border-bottom-width'), 10),
      left: parseInt(this.$image.css('border-left-width'), 10)
    };

    // Attach event handlers to the newly minted DOM elements
    this.$overlay.hide().on('click', function() {
      self.end();
      return false;
    });

    this.$lightbox.hide().on('click', function(event) {
      if ($(event.target).attr('id') === 'lightbox') {
        self.end();
      }
    });

    this.$outerContainer.on('click', function(event) {
      if ($(event.target).attr('id') === 'lightbox') {
        self.end();
      }
      return false;
    });

    this.$prev.on('click', function(event) {
      event.preventDefault();
      if (self.currentImageIndex === 0) {
        self.changeImage(self.album.length - 1);
      } else {
        self.changeImage(self.currentImageIndex - 1);
      }
    });

    this.$next.on('click', function(event) {
      event.preventDefault();
      if (self.currentImageIndex === self.album.length - 1) {
        self.changeImage(0);
      } else {
        self.changeImage(self.currentImageIndex + 1);
      }
    });

    /*
      Show context menu for image on right-click

      There is a div containing the navigation that spans the entire image and lives above of it. If
      you right-click, you are right clicking this div and not the image. This prevents users from
      saving the image or using other context menu actions with the image.

      To fix this, when we detect the right mouse button is pressed down, but not yet clicked, we
      set pointer-events to none on the nav div. This is so that the upcoming right-click event on
      the next mouseup will bubble down to the image. Once the right-click/contextmenu event occurs
      we set the pointer events back to auto for the nav div so it can capture hover and left-click
      events as usual.
     */
    this.$nav.on('mousedown', function(event) {
      if (event.which === 3) {
        self.$nav.css('pointer-events', 'none');

        self.$lightbox.one('contextmenu', function() {
          setTimeout(function() {
            self.$nav.css('pointer-events', 'auto');
          }, 0);
        });
      }
    });


    this.$loader.add(this.$close).on('click keyup', function(e) {
      // If mouse click OR 'enter' or 'space' keypress, close LB
      if (
        e.type === 'click' || (e.type === 'keyup' && (e.which === 13 || e.which === 32))) {
        self.end();
        return false;
      }
    });
  };

  // Show overlay and lightbox. If the image is part of a set, add siblings to album array.
  Lightbox.prototype.start = function($link) {
    var self = this;

    // Store trigger element for focus restoration on close
    this.$triggerElement = $link;

    this.album = [];
    var imageNumber = 0;

    function addToAlbum($link) {
      self.album.push({
        alt: $link.attr('data-alt'),
        link: $link.attr('href'),
        title: $link.attr('data-title') || $link.attr('title')
      });
    }

    // Support both data-lightbox attribute and rel attribute implementations
    var dataLightboxValue = $link.attr('data-lightbox');
    var $links;

    if (dataLightboxValue) {
      $links = $($link.prop('tagName')).filter(function() {
        return $(this).attr('data-lightbox') === dataLightboxValue;
      });
      for (var i = 0; i < $links.length; i++) {
        addToAlbum($($links[i]));
        if ($links[i] === $link[0]) {
          imageNumber = i;
        }
      }
    } else {
      if ($link.attr('rel') === 'lightbox') {
        // If image is not part of a set
        addToAlbum($link);
      } else {
        // If image is part of a set
        var relValue = $link.attr('rel');
        $links = $($link.prop('tagName')).filter(function() {
          return $(this).attr('rel') === relValue;
        });
        for (var j = 0; j < $links.length; j++) {
          addToAlbum($($links[j]));
          if ($links[j] === $link[0]) {
            imageNumber = j;
          }
        }
      }
    }

    // Position Lightbox
    this.$lightbox.css({
      top: this.options.positionFromTop + 'px',
      left: '0px'
    }).fadeIn(this.options.fadeDuration);

    // Disable scrolling of the page while open
    if (this.options.disableScrolling) {
      $('body').addClass('lb-disable-scrolling');
    }

    // Enable focus trap
    this.$lightbox.on('keydown.focustrap', $.proxy(this._trapFocus, this));
    this.$overlay.on('keydown.focustrap', $.proxy(this._trapFocus, this));

    this.changeImage(imageNumber);

    $(document).trigger('lightbox:open', [{ album: this.album, currentImageIndex: imageNumber }]);
  };

  // Hide most UI elements in preparation for the animated resizing of the lightbox.
  Lightbox.prototype.changeImage = function(imageNumber) {
    var self = this;
    var filename = this.album[imageNumber].link;
    var filetype = filename.split('?')[0].split('#')[0].split('.').slice(-1)[0];

    // Disable keyboard nav during transitions
    this.disableKeyboardNav();

    // Show loading state
    this.$overlay.fadeIn(this.options.fadeDuration);
    this.$loader.fadeIn('slow');
    this.$image.hide();
    this.$nav.hide();
    this.$prev.hide();
    this.$next.hide();
    this.$dataContainer.hide();
    this.$number.hide();
    this.$caption.hide();
    this.$outerContainer.addClass('animating');

    // Cancel any pending image load
    if (this._preloader) {
      this._preloader.onload = null;
      this._preloader.onerror = null;
    }

    // When image to show is preloaded, we send the width and height to sizeContainer()
    var preloader = new Image();
    this._preloader = preloader;

    preloader.onload = function() {
      // Guard against stale callbacks from cancelled loads
      if (preloader !== self._preloader) {
        return;
      }

      var imageHeight;
      var imageWidth;
      var maxImageHeight;
      var maxImageWidth;
      var windowHeight;
      var windowWidth;

      self.$image.attr({
        'alt': self.album[imageNumber].alt,
        'src': filename
      });

      self.$image.width(preloader.width);
      self.$image.height(preloader.height);

      var aspectRatio = preloader.width / preloader.height;

      windowWidth = $(window).width();
      windowHeight = $(window).height();

      // Calculate the max image dimensions for the current viewport.
      // Take into account the border around the image and an additional 10px gutter on each side.
      maxImageWidth  = windowWidth - self.containerPadding.left - self.containerPadding.right - self.imageBorderWidth.left - self.imageBorderWidth.right - 20;
      maxImageHeight = windowHeight - self.containerPadding.top - self.containerPadding.bottom - self.imageBorderWidth.top - self.imageBorderWidth.bottom - self.options.positionFromTop - 70;

      /*
      Since many SVGs have small intrinsic dimensions, but they support scaling
      up without quality loss because of their vector format, max out their
      size inside the viewport.
      */
      if (filetype === 'svg') {
        if (aspectRatio >= 1) {
          imageWidth = maxImageWidth;
          imageHeight = parseInt(maxImageWidth / aspectRatio, 10);
        } else {
          imageWidth = parseInt(maxImageHeight / aspectRatio, 10);
          imageHeight = maxImageHeight;
        }
        self.$image.width(imageWidth);
        self.$image.height(imageHeight);

      } else {

        // Fit image inside the viewport.
        if (self.options.fitImagesInViewport) {

          // Check if image size is larger then maxWidth|maxHeight in settings
          if (self.options.maxWidth && self.options.maxWidth < maxImageWidth) {
            maxImageWidth = self.options.maxWidth;
          }
          if (self.options.maxHeight && self.options.maxHeight < maxImageHeight) {
            maxImageHeight = self.options.maxHeight;
          }

        } else {
          maxImageWidth = self.options.maxWidth || preloader.width || maxImageWidth;
          maxImageHeight = self.options.maxHeight || preloader.height || maxImageHeight;
        }

        // Is the current image's width or height is greater than the maxImageWidth or maxImageHeight
        // option than we need to size down while maintaining the aspect ratio.
        if ((preloader.width > maxImageWidth) || (preloader.height > maxImageHeight)) {
          if ((preloader.width / maxImageWidth) > (preloader.height / maxImageHeight)) {
            imageWidth  = maxImageWidth;
            imageHeight = parseInt(preloader.height / (preloader.width / imageWidth), 10);
            self.$image.width(imageWidth);
            self.$image.height(imageHeight);
          } else {
            imageHeight = maxImageHeight;
            imageWidth = parseInt(preloader.width / (preloader.height / imageHeight), 10);
            self.$image.width(imageWidth);
            self.$image.height(imageHeight);
          }
        }
      }

      self.sizeContainer(self.$image.width(), self.$image.height());
    };

    preloader.onerror = function() {
      // Guard against stale callbacks
      if (preloader !== self._preloader) {
        return;
      }

      self.$loader.stop(true).hide();
      self.$outerContainer.removeClass('animating');
      self.enableKeyboardNav();
    };

    // Preload image before showing
    preloader.src = this.album[imageNumber].link;
    this.currentImageIndex = imageNumber;
  };

  // Kept for backwards compatibility. Overlay sizing is now handled by CSS (position: fixed).
  Lightbox.prototype.sizeOverlay = function() {
  };

  // Animate the size of the lightbox to fit the image we are showing
  // This method also shows the the image.
  Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
    var self = this;

    var oldWidth  = this.$outerContainer.outerWidth();
    var oldHeight = this.$outerContainer.outerHeight();
    var newWidth  = imageWidth + this.containerPadding.left + this.containerPadding.right + this.imageBorderWidth.left + this.imageBorderWidth.right;
    var newHeight = imageHeight + this.containerPadding.top + this.containerPadding.bottom + this.imageBorderWidth.top + this.imageBorderWidth.bottom;

    function postResize() {
      self.$dataContainer.width(newWidth);
      self.$prev.height(newHeight);
      self.$next.height(newHeight);

      // Set focus on one of the two root nodes so keyboard events are captured.
      self.$overlay.trigger('focus');

      self.showImage();
    }

    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      this.$outerContainer.animate({
        width: newWidth,
        height: newHeight
      }, this.options.resizeDuration, 'swing', function() {
        postResize();
      });
    } else {
      postResize();
    }
  };

  // Display the image and its details and begin preload neighboring images.
  Lightbox.prototype.showImage = function() {
    this.$loader.stop(true).hide();
    this.$image.fadeIn(this.options.imageFadeDuration);

    this.updateNav();
    this.updateDetails();
    this.preloadNeighboringImages();
    this.enableKeyboardNav();

    $(document).trigger('lightbox:change', [{
      album: this.album,
      currentImageIndex: this.currentImageIndex
    }]);
  };

  // Display previous and next navigation if appropriate.
  Lightbox.prototype.updateNav = function() {
    // Check to see if the browser supports touch events. If so, we take the conservative approach
    // and assume that mouse hover events are not supported and always show prev/next navigation
    // arrows in image sets.
    var alwaysShowNav = false;
    try {
      document.createEvent('TouchEvent');
      alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices) ? true : false;
    } catch (ignore) { /* Touch detection */ }

    this.$nav.show();

    if (this.album.length > 1) {
      if (this.options.wrapAround) {
        if (alwaysShowNav) {
          this.$prev.css('opacity', '1');
          this.$next.css('opacity', '1');
        }
        this.$prev.show();
        this.$next.show();
      } else {
        if (this.currentImageIndex > 0) {
          this.$prev.show();
          if (alwaysShowNav) {
            this.$prev.css('opacity', '1');
          }
        }
        if (this.currentImageIndex < this.album.length - 1) {
          this.$next.show();
          if (alwaysShowNav) {
            this.$next.css('opacity', '1');
          }
        }
      }
    }
  };

  // Display caption, image number, and closing button.
  Lightbox.prototype.updateDetails = function() {
    // Enable anchor clicks in the injected caption html.
    // Thanks Nate Wright for the fix. @https://github.com/NateWr
    if (typeof this.album[this.currentImageIndex].title !== 'undefined' &&
      this.album[this.currentImageIndex].title !== '') {
      if (this.options.sanitizeTitle) {
        this.$caption.text(this.album[this.currentImageIndex].title);
      } else {
        this.$caption.html(this.album[this.currentImageIndex].title);
      }
      this.$caption.fadeIn('fast');
    }

    if (this.album.length > 1 && this.options.showImageNumberLabel) {
      var labelText = this.imageCountLabel(this.currentImageIndex + 1, this.album.length);
      this.$number.text(labelText).fadeIn('fast');
    } else {
      this.$number.hide();
    }

    this.$outerContainer.removeClass('animating');

    this.$dataContainer.fadeIn(this.options.resizeDuration);
  };

  // Preload previous and next images in set.
  Lightbox.prototype.preloadNeighboringImages = function() {
    if (this.album.length > this.currentImageIndex + 1) {
      var preloadNext = new Image();
      preloadNext.src = this.album[this.currentImageIndex + 1].link;
    }
    if (this.currentImageIndex > 0) {
      var preloadPrev = new Image();
      preloadPrev.src = this.album[this.currentImageIndex - 1].link;
    }
  };

  Lightbox.prototype.enableKeyboardNav = function() {
    this.$lightbox.on('keyup.keyboard', $.proxy(this.keyboardAction, this));
    this.$overlay.on('keyup.keyboard', $.proxy(this.keyboardAction, this));
  };

  Lightbox.prototype.disableKeyboardNav = function() {
    this.$lightbox.off('.keyboard');
    this.$overlay.off('.keyboard');
  };

  Lightbox.prototype.keyboardAction = function(event) {
    var KEYCODE_ESC        = 27;
    var KEYCODE_LEFTARROW  = 37;
    var KEYCODE_RIGHTARROW = 39;

    var keycode = event.keyCode;
    if (keycode === KEYCODE_ESC) {
      // Prevent bubbling so as to not affect other components on the page.
      event.stopPropagation();
      this.end();
    } else if (keycode === KEYCODE_LEFTARROW) {
      if (this.currentImageIndex !== 0) {
        this.changeImage(this.currentImageIndex - 1);
      } else if (this.options.wrapAround && this.album.length > 1) {
        this.changeImage(this.album.length - 1);
      }
    } else if (keycode === KEYCODE_RIGHTARROW) {
      if (this.currentImageIndex !== this.album.length - 1) {
        this.changeImage(this.currentImageIndex + 1);
      } else if (this.options.wrapAround && this.album.length > 1) {
        this.changeImage(0);
      }
    }
  };

  // Trap focus within the lightbox when it is open.
  Lightbox.prototype._trapFocus = function(event) {
    if (event.keyCode !== 9) {
      return;
    }

    var focusable = this.$lightbox.find('[tabindex]:visible').filter(function() {
      return parseInt($(this).attr('tabindex'), 10) >= 0;
    });

    if (focusable.length === 0) {
      return;
    }

    var first = focusable.first()[0];
    var last = focusable.last()[0];
    var active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || active === this.$lightbox[0] || active === this.$overlay[0]) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  // Closing time. :-(
  Lightbox.prototype.end = function() {
    this.disableKeyboardNav();
    this.$lightbox.off('.focustrap');
    this.$overlay.off('.focustrap');
    this.$lightbox.fadeOut(this.options.fadeDuration);
    this.$overlay.fadeOut(this.options.fadeDuration);

    if (this.options.disableScrolling) {
      $('body').removeClass('lb-disable-scrolling');
    }

    // Cancel any pending image load
    if (this._preloader) {
      this._preloader.onload = null;
      this._preloader.onerror = null;
      this._preloader = null;
    }

    // Restore focus to the element that triggered the lightbox
    if (this.$triggerElement) {
      this.$triggerElement.trigger('focus');
      this.$triggerElement = null;
    }

    $(document).trigger('lightbox:close');
  };

  // --- Public API ---

  // Open lightbox programmatically.
  // images: a URL string, or an array of {link, title, alt} objects.
  // startIndex: which image to show first (default 0).
  Lightbox.prototype.open = function(images, startIndex) {
    startIndex = startIndex || 0;
    this.album = [];

    if (typeof images === 'string') {
      images = [{ link: images }];
    }

    for (var i = 0; i < images.length; i++) {
      var img = typeof images[i] === 'string' ? { link: images[i] } : images[i];
      this.album.push({
        link: img.link || img.src || img.href,
        alt: img.alt || '',
        title: img.title || ''
      });
    }

    if (this.album.length === 0) {
      return;
    }

    this.$lightbox.css({
      top: this.options.positionFromTop + 'px',
      left: '0px'
    }).fadeIn(this.options.fadeDuration);

    if (this.options.disableScrolling) {
      $('body').addClass('lb-disable-scrolling');
    }

    this.$lightbox.on('keydown.focustrap', $.proxy(this._trapFocus, this));
    this.$overlay.on('keydown.focustrap', $.proxy(this._trapFocus, this));

    this.changeImage(startIndex);

    $(document).trigger('lightbox:open', [{ album: this.album, currentImageIndex: startIndex }]);
  };

  // Close lightbox programmatically.
  Lightbox.prototype.close = function() {
    this.end();
  };

  // Navigate to the next image in the album.
  Lightbox.prototype.next = function() {
    if (this.currentImageIndex !== this.album.length - 1) {
      this.changeImage(this.currentImageIndex + 1);
    } else if (this.options.wrapAround && this.album.length > 1) {
      this.changeImage(0);
    }
  };

  // Navigate to the previous image in the album.
  Lightbox.prototype.prev = function() {
    if (this.currentImageIndex !== 0) {
      this.changeImage(this.currentImageIndex - 1);
    } else if (this.options.wrapAround && this.album.length > 1) {
      this.changeImage(this.album.length - 1);
    }
  };

  // Remove lightbox DOM and unbind all events.
  Lightbox.prototype.destroy = function() {
    this.end();
    $('body').off('click.lightbox');
    if (this.$lightbox) {
      this.$lightbox.remove();
    }
    if (this.$overlay) {
      this.$overlay.remove();
    }
  };

  return new Lightbox();
}));
