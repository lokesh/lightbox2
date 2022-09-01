/* global jQuery */

class Lightbox {
  album = [];
  currentImageIndex = 0;
  options;
  $lightbox;
  $overlay;
  $outerContainer;
  $container;
  $image;
  $nav;
  containerPadding;
  imageBorderWidth;

  constructor(options) {
    this.init();

    // options
    this.options = Object.assign({}, Lightbox.defaults);
    this.option(options);
  }

  /**
   * Descriptions of all options available on the demo site:
   * http://lokeshdhakar.com/projects/lightbox2/index.html#options
   */
  static defaults = {
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

  option(options) {
    Object.assign(this.options, options);
  }

  imageCountLabel(currentImageNum, totalImages) {
    return this.options.albumLabel
      .replace(/%1/g, currentImageNum)
      .replace(/%2/g, totalImages);
  }

  init() {
    // Both enable and build methods require the body tag to be in the DOM.
    jQuery(() => {
      this.enable();
      this.build();
    });
  }

  /**
   * Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
   * that contain 'lightbox'. When these are clicked, start lightbox.
   */
  enable() {
    jQuery('body').on(
      'click',
      'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]',
      (event) => {
        this.start(jQuery(event.currentTarget));
        return false;
      }
    );
  }

  /**
   * Build html for the lightbox and the overlay.
   * Attach event handlers to the new DOM elements. click click click
   */
  build() {
    if (jQuery('#lightbox').length > 0) {
      return;
    }

    /**
     * The two root notes generated, #lightboxOverlay and #lightbox are given
     * tabindex attrs so they are focusable. We attach our keyboard event
     * listeners to these two elements, and not the document. Clicking anywhere
     * while Lightbox is opened will keep the focus on or inside one of these
     * two elements.
     *
     * We do this so we can prevent propogation of the Esc keypress when
     * Lightbox is open. This prevents it from intefering with other components
     * on the page below.
     *
     * Github issue: https://github.com/lokesh/lightbox2/issues/663
     */
    jQuery(
      '<div id="lightboxOverlay" tabindex="-1" class="lightboxOverlay"></div><div id="lightbox" tabindex="-1" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" alt=""/><div class="lb-nav"><a class="lb-prev" aria-label="Previous image" href="" ></a><a class="lb-next" aria-label="Next image" href="" ></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span><span class="lb-number"></span></div><div class="lb-closeContainer"><a class="lb-close"></a></div></div></div></div>'
    ).appendTo(jQuery('body'));

    // Cache jQuery objects
    this.$lightbox = jQuery('#lightbox');
    this.$overlay = jQuery('#lightboxOverlay');
    this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
    this.$container = this.$lightbox.find('.lb-container');
    this.$image = this.$lightbox.find('.lb-image');
    this.$nav = this.$lightbox.find('.lb-nav');

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
    this.$overlay.hide().on('click', () => {
      this.end();
      return false;
    });

    this.$lightbox.hide().on('click', (event) => {
      if (jQuery(event.target).attr('id') === 'lightbox') {
        this.end();
      }
    });

    this.$outerContainer.on('click', (event) => {
      if (jQuery(event.target).attr('id') === 'lightbox') {
        this.end();
      }
      return false;
    });

    this.$lightbox.find('.lb-prev').on('click', () => {
      if (this.currentImageIndex === 0) {
        this.changeImage(this.album.length - 1);
      } else {
        this.changeImage(this.currentImageIndex - 1);
      }
      return false;
    });

    this.$lightbox.find('.lb-next').on('click', () => {
      if (this.currentImageIndex === this.album.length - 1) {
        this.changeImage(0);
      } else {
        this.changeImage(this.currentImageIndex + 1);
      }
      return false;
    });

    /**
     *  Show context menu for image on right-click
     *
     *  There is a div containing the navigation that spans the entire image and lives above of it. If
     *  you right-click, you are right clicking this div and not the image. This prevents users from
     *  saving the image or using other context menu actions with the image.
     *
     *  To fix this, when we detect the right mouse button is pressed down, but not yet clicked, we
     *  set pointer-events to none on the nav div. This is so that the upcoming right-click event on
     *  the next mouseup will bubble down to the image. Once the right-click/contextmenu event occurs
     *  we set the pointer events back to auto for the nav div so it can capture hover and left-click
     *  events as usual.
     */
    this.$nav.on('mousedown', (event) => {
      if (event.which === 3) {
        this.$nav.css('pointer-events', 'none');

        this.$lightbox.one('contextmenu', () => {
          setTimeout(() => {
            this.$nav.css('pointer-events', 'auto');
          }, 0);
        });
      }
    });

    this.$lightbox.find('.lb-loader, .lb-close').on('click', () => {
      this.end();
      return false;
    });
  }

  /**
   * Show overlay and lightbox. If the image is part of a set, add siblings to album array.
   */
  start($link) {
    const $window = jQuery(window);

    $window.on('resize', jQuery.proxy(this.sizeOverlay, this));

    this.sizeOverlay();

    this.album = [];
    let imageNumber = 0;

    function addToAlbum($link) {
      this.album.push({
        alt: $link.attr('data-alt'),
        link: $link.attr('href'),
        title: $link.attr('data-title') || $link.attr('title')
      });
    }

    // Support both data-lightbox attribute and rel attribute implementations
    const dataLightboxValue = $link.attr('data-lightbox');
    let $links;

    if (dataLightboxValue) {
      $links = jQuery(
        $link.prop('tagName') + '[data-lightbox="' + dataLightboxValue + '"]'
      );
      for (let i = 0; i < $links.length; i = ++i) {
        addToAlbum(jQuery($links[i]));
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
        $links = jQuery(
          $link.prop('tagName') + '[rel="' + $link.attr('rel') + '"]'
        );
        for (let j = 0; j < $links.length; j = ++j) {
          addToAlbum(jQuery($links[j]));
          if ($links[j] === $link[0]) {
            imageNumber = j;
          }
        }
      }
    }

    // Position Lightbox
    const top = $window.scrollTop() + this.options.positionFromTop;
    const left = $window.scrollLeft();
    this.$lightbox
      .css({
        top: top + 'px',
        left: left + 'px'
      })
      .fadeIn(this.options.fadeDuration);

    // Disable scrolling of the page while open
    if (this.options.disableScrolling) {
      jQuery('body').addClass('lb-disable-scrolling');
    }

    this.changeImage(imageNumber);
  }

  // Hide most UI elements in preparation for the animated resizing of the lightbox.
  changeImage(imageNumber) {
    const filename = this.album[imageNumber].link;
    const filetype = filename.split('.').slice(-1)[0];
    const $image = this.$lightbox.find('.lb-image');

    // Disable keyboard nav during transitions
    this.disableKeyboardNav();

    // Show loading state
    this.$overlay.fadeIn(this.options.fadeDuration);
    jQuery('.lb-loader').fadeIn('slow');
    this.$lightbox
      .find(
        '.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption'
      )
      .hide();
    this.$outerContainer.addClass('animating');

    // When image to show is preloaded, we send the width and height to sizeContainer()
    const preloader = new Image();
    preloader.onload = () => {
      $image.attr({
        alt: this.album[imageNumber].alt,
        src: filename
      });

      const $preloader = jQuery(preloader);

      $image.width(preloader.width);
      $image.height(preloader.height);
      let windowWidth = jQuery(window).width();
      let windowHeight = jQuery(window).height();

      // Calculate the max image dimensions for the current viewport.
      // Take into account the border around the image and an additional 10px gutter on each side.
      let maxImageWidth =
        windowWidth -
        this.containerPadding.left -
        this.containerPadding.right -
        this.imageBorderWidth.left -
        this.imageBorderWidth.right -
        20;
      let maxImageHeight =
        windowHeight -
        this.containerPadding.top -
        this.containerPadding.bottom -
        this.imageBorderWidth.top -
        this.imageBorderWidth.bottom -
        this.options.positionFromTop -
        70;

      /*
        Since many SVGs have small intrinsic dimensions, but they support scaling
        up without quality loss because of their vector format, max out their
        size.
        */
      if (filetype === 'svg') {
        $image.width(maxImageWidth);
        $image.height(maxImageHeight);
      }

      // Fit image inside the viewport.
      if (this.options.fitImagesInViewport) {
        // Check if image size is larger then maxWidth|maxHeight in settings
        if (this.options.maxWidth && this.options.maxWidth < maxImageWidth) {
          maxImageWidth = this.options.maxWidth;
        }
        if (this.options.maxHeight && this.options.maxHeight < maxImageHeight) {
          maxImageHeight = this.options.maxHeight;
        }
      } else {
        maxImageWidth =
          this.options.maxWidth || preloader.width || maxImageWidth;
        maxImageHeight =
          this.options.maxHeight || preloader.height || maxImageHeight;
      }

      let imageHeight;
      let imageWidth;

      // Is the current image's width or height is greater than the maxImageWidth or maxImageHeight
      // option than we need to size down while maintaining the aspect ratio.
      if (
        preloader.width > maxImageWidth ||
        preloader.height > maxImageHeight
      ) {
        if (
          preloader.width / maxImageWidth >
          preloader.height / maxImageHeight
        ) {
          imageWidth = maxImageWidth;
          imageHeight = parseInt(
            preloader.height / (preloader.width / imageWidth),
            10
          );
          $image.width(imageWidth);
          $image.height(imageHeight);
        } else {
          imageHeight = maxImageHeight;
          imageWidth = parseInt(
            preloader.width / (preloader.height / imageHeight),
            10
          );
          $image.width(imageWidth);
          $image.height(imageHeight);
        }
      }
      this.sizeContainer($image.width(), $image.height());
    };

    // Preload image before showing
    preloader.src = this.album[imageNumber].link;
    this.currentImageIndex = imageNumber;
  }

  /**
   * Stretch overlay to fit the viewport
   */
  sizeOverlay() {
    /*
      We use a setTimeout 0 to pause JS execution and let the rendering catch-up.
      Why do this? If the `disableScrolling` option is set to true, a class is added to the body
      tag that disables scrolling and hides the scrollbar. We want to make sure the scrollbar is
      hidden before we measure the document width, as the presence of the scrollbar will affect the
      number.
      */
    setTimeout(() => {
      this.$overlay
        .width(jQuery(document).width())
        .height(jQuery(document).height());
    }, 0);
  }

  /**
   * Animate the size of the lightbox to fit the image we are showing
   * This method also shows the the image.
   */
  sizeContainer(imageWidth, imageHeight) {
    const oldWidth = this.$outerContainer.outerWidth();
    const oldHeight = this.$outerContainer.outerHeight();
    const newWidth =
      imageWidth +
      this.containerPadding.left +
      this.containerPadding.right +
      this.imageBorderWidth.left +
      this.imageBorderWidth.right;
    const newHeight =
      imageHeight +
      this.containerPadding.top +
      this.containerPadding.bottom +
      this.imageBorderWidth.top +
      this.imageBorderWidth.bottom;

    const postResize = () => {
      this.$lightbox.find('.lb-dataContainer').width(newWidth);
      this.$lightbox.find('.lb-prevLink').height(newHeight);
      this.$lightbox.find('.lb-nextLink').height(newHeight);

      // Set focus on one of the two root nodes so keyboard events are captured.
      this.$overlay.focus();

      this.showImage();
    };

    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      this.$outerContainer.animate(
        {
          width: newWidth,
          height: newHeight
        },
        this.options.resizeDuration,
        'swing',
        () => {
          postResize();
        }
      );
    } else {
      postResize();
    }
  }

  // Display the image and its details and begin preload neighboring images.
  showImage() {
    this.$lightbox.find('.lb-loader').stop(true).hide();
    this.$lightbox.find('.lb-image').fadeIn(this.options.imageFadeDuration);

    this.updateNav();
    this.updateDetails();
    this.preloadNeighboringImages();
    this.enableKeyboardNav();
  }

  // Display previous and next navigation if appropriate.
  updateNav() {
    // Check to see if the browser supports touch events. If so, we take the conservative approach
    // and assume that mouse hover events are not supported and always show prev/next navigation
    // arrows in image sets.
    let alwaysShowNav = false;
    try {
      document.createEvent('TouchEvent');
      alwaysShowNav = this.options.alwaysShowNavOnTouchDevices ? true : false;
    } catch (e) {}

    this.$lightbox.find('.lb-nav').show();

    if (this.album.length > 1) {
      if (this.options.wrapAround) {
        if (alwaysShowNav) {
          this.$lightbox.find('.lb-prev, .lb-next').css('opacity', '1');
        }
        this.$lightbox.find('.lb-prev, .lb-next').show();
      } else {
        if (this.currentImageIndex > 0) {
          this.$lightbox.find('.lb-prev').show();
          if (alwaysShowNav) {
            this.$lightbox.find('.lb-prev').css('opacity', '1');
          }
        }
        if (this.currentImageIndex < this.album.length - 1) {
          this.$lightbox.find('.lb-next').show();
          if (alwaysShowNav) {
            this.$lightbox.find('.lb-next').css('opacity', '1');
          }
        }
      }
    }
  }

  // Display caption, image number, and closing button.
  updateDetails() {
    // Enable anchor clicks in the injected caption html.
    // Thanks Nate Wright for the fix. @https://github.com/NateWr
    if (
      typeof this.album[this.currentImageIndex].title !== 'undefined' &&
      this.album[this.currentImageIndex].title !== ''
    ) {
      const $caption = this.$lightbox.find('.lb-caption');
      if (this.options.sanitizeTitle) {
        $caption.text(this.album[this.currentImageIndex].title);
      } else {
        $caption.html(this.album[this.currentImageIndex].title);
      }
      $caption.fadeIn('fast');
    }

    if (this.album.length > 1 && this.options.showImageNumberLabel) {
      const labelText = this.imageCountLabel(
        this.currentImageIndex + 1,
        this.album.length
      );
      this.$lightbox.find('.lb-number').text(labelText).fadeIn('fast');
    } else {
      this.$lightbox.find('.lb-number').hide();
    }

    this.$outerContainer.removeClass('animating');

    this.$lightbox
      .find('.lb-dataContainer')
      .fadeIn(this.options.resizeDuration, () => {
        return this.sizeOverlay();
      });
  }

  /**
   * Preload previous and next images in set.
   */
  preloadNeighboringImages() {
    if (this.album.length > this.currentImageIndex + 1) {
      const preloadNext = new Image();
      preloadNext.src = this.album[this.currentImageIndex + 1].link;
    }
    if (this.currentImageIndex > 0) {
      const preloadPrev = new Image();
      preloadPrev.src = this.album[this.currentImageIndex - 1].link;
    }
  }

  enableKeyboardNav() {
    this.$lightbox.on(
      'keyup.keyboard',
      jQuery.proxy(this.keyboardAction, this)
    );
    this.$overlay.on('keyup.keyboard', jQuery.proxy(this.keyboardAction, this));
  }

  disableKeyboardNav() {
    this.$lightbox.off('.keyboard');
    this.$overlay.off('.keyboard');
  }

  keyboardAction(event) {
    const KEYCODE_ESC = 27;
    const KEYCODE_LEFTARROW = 37;
    const KEYCODE_RIGHTARROW = 39;

    const keycode = event.keyCode;
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
  }

  // Closing time. :-(
  end() {
    this.disableKeyboardNav();
    jQuery(window).off('resize', this.sizeOverlay);
    this.$lightbox.fadeOut(this.options.fadeDuration);
    this.$overlay.fadeOut(this.options.fadeDuration);

    if (this.options.disableScrolling) {
      jQuery('body').removeClass('lb-disable-scrolling');
    }
  }
}

export default new Lightbox();
