/** @param {() => void} callback */
const domReady = (callback) => {
  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', callback, {
      once: true,
      passive: true
    });
  } else {
    callback();
  }
};

class Lightbox {
  album = [];
  currentImageIndex = 0;
  options = Object.assign(Object.create(null), Lightbox.defaults);
  /** @type {HTMLElement} */
  lightbox;
  /** @type {HTMLElement} */
  overlay;
  /** @type {HTMLElement} */
  outerContainer;
  /** @type {HTMLImageElement} */
  image;
  /** @type {HTMLElement} */
  nav;
  /** @type {HTMLElement} */
  prev;
  /** @type {HTMLElement} */
  next;
  /** @type {HTMLElement} */
  loader;
  /** @type {HTMLElement} */
  dataContainer;
  /** @type {HTMLElement} */
  caption;
  /** @type {HTMLElement} */
  number;
  /** @type { { top: number; right: number; bottom: number; left: number; } } */
  containerPadding;
  /** @type { { top: number; right: number; bottom: number; left: number; } } */
  imageBorderWidth;
  sizeOverlayBind = () => {
    this.sizeOverlay;
  };
  /** @param {KeyboardEvent} event */
  keyboardActionBind = (event) => {
    this.keyboardAction(event);
  };

  constructor(options) {
    this.init();
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
    domReady(() => {
      this.enable();
      this.build();
    });
  }

  /**
   * Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
   * that contain 'lightbox'. When these are clicked, start lightbox.
   */
  enable() {
    const self = this;

    /**
     * @param {MouseEvent} event
     * @this {HTMLAnchorElement|HTMLAreaElement}
     */
    function listener(event) {
      event.preventDefault();
      event.stopPropagation();
      self.start(this);
    }

    const { links } = document;
    const { length } = links;

    for (let i = 0; i < length; i++) {
      const link = links[i];
      if (link.rel.startsWith('lightbox') || link.dataset.lightbox !== void 0) {
        link.addEventListener('click', listener);
      }
    }
  }

  /**
   * Build html for the lightbox and the overlay.
   * Attach event handlers to the new DOM elements. click click click
   */
  build() {
    if (document.getElementById('lightbox')) {
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
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="lightboxOverlay" tabindex="-1" class="lightboxOverlay"></div><div id="lightbox" tabindex="-1" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" alt=""/><div class="lb-nav"><a class="lb-prev" aria-label="Previous image" href="" ></a><a class="lb-next" aria-label="Next image" href="" ></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span><span class="lb-number"></span></div><div class="lb-closeContainer"><a class="lb-close"></a></div></div></div></div>'
    );

    // Cache DOM objects
    this.lightbox = document.getElementById('lightbox');
    this.overlay = document.getElementById('lightboxOverlay');
    this.outerContainer = this.lightbox.querySelector('.lb-outerContainer');
    this.dataContainer = this.lightbox.querySelector('.lb-dataContainer');
    const container = this.lightbox.querySelector('.lb-container');
    this.image = this.lightbox.querySelector('.lb-image');
    this.nav = this.lightbox.querySelector('.lb-nav');
    this.prev = this.lightbox.querySelector('.lb-prev');
    this.next = this.lightbox.querySelector('.lb-next');
    this.loader = this.lightbox.querySelector('.lb-loader');
    const close = this.lightbox.querySelector('.lb-close');
    this.caption = this.lightbox.querySelector('.lb-caption');
    this.number = this.lightbox.querySelector('.lb-number');

    // Store css values for future lookup
    const containerStyle = getComputedStyle(container);
    this.containerPadding = {
      top: Math.floor(Number.parseFloat(containerStyle.paddingTop)),
      right: Math.floor(Number.parseFloat(containerStyle.paddingRight)),
      bottom: Math.floor(Number.parseFloat(containerStyle.paddingBottom)),
      left: Math.floor(Number.parseFloat(containerStyle.paddingLeft))
    };

    const imageStyle = getComputedStyle(this.image);
    this.imageBorderWidth = {
      top: Math.floor(Number.parseFloat(imageStyle.borderTopWidth)),
      right: Math.floor(Number.parseFloat(imageStyle.borderRightWidth)),
      bottom: Math.floor(Number.parseFloat(imageStyle.borderBottomWidth)),
      left: Math.floor(Number.parseFloat(imageStyle.borderLeftWidth))
    };

    /** @param {Event} event */
    const endListener = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.end();
    };

    // Attach event handlers to the newly minted DOM elements
    this.overlay.style.display = 'none';
    this.overlay.addEventListener('click', endListener);

    this.lightbox.style.display = 'none';
    this.lightbox.addEventListener(
      'click',
      (event) => {
        if (event.target === event.currentTarget) {
          this.end();
        }
      },
      { passive: true }
    );

    this.outerContainer.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) {
        endListener(event);
      }
    });

    this.prev.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.currentImageIndex === 0) {
        this.changeImage(this.album.length - 1);
      } else {
        this.changeImage(this.currentImageIndex - 1);
      }
    });

    this.next.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.currentImageIndex === this.album.length - 1) {
        this.changeImage(0);
      } else {
        this.changeImage(this.currentImageIndex + 1);
      }
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
    this.nav.addEventListener('mousedown', (event) => {
      if (event.button === 2) {
        this.nav.style.pointerEvents = 'none';

        this.lightbox.addEventListener(
          'contextmenu',
          () => {
            setTimeout(() => {
              this.nav.style.pointerEvents = 'auto';
            }, 0);
          },
          { once: true }
        );
      }
    });

    for (const element of [this.loader, close]) {
      element.addEventListener('click', endListener);
    }
  }

  /**
   * Show overlay and lightbox. If the image is part of a set, add siblings to album array.
   * @param {HTMLAnchorElement|HTMLAreaElement} link
   */
  start(link) {
    window.addEventListener('resize', this.sizeOverlayBind, { passive: true });

    this.sizeOverlay();

    this.album = [];
    let imageNumber = 0;

    /** @param {HTMLAnchorElement|HTMLAreaElement} link */
    const addToAlbum = (link) => {
      this.album.push({
        alt: link.dataset.alt || '',
        link: link.getAttribute('href'),
        title: link.dataset.title || link.title
      });
    };

    // Support both data-lightbox attribute and rel attribute implementations
    const dataLightboxValue = link.dataset.lightbox;

    if (dataLightboxValue) {
      /** @type {NodeListOf<HTMLAnchorElement|HTMLAreaElement>} */
      const links = document.querySelectorAll(
        `${link.tagName}[data-lightbox="${dataLightboxValue}"]`
      );
      for (let i = 0; i < links.length; i = ++i) {
        addToAlbum(links[i]);
        if (links[i] === link) {
          imageNumber = i;
        }
      }
    } else if (link.rel === 'lightbox') {
      // If image is not part of a set
      addToAlbum(link);
    } else {
      // If image is part of a set
      /** @type {NodeListOf<HTMLAnchorElement|HTMLAreaElement>} */
      const links = document.querySelectorAll(
        `${link.tagName}[rel="${link.rel}"]`
      );
      for (let j = 0; j < links.length; j = ++j) {
        addToAlbum(links[j]);
        if (links[j] === link) {
          imageNumber = j;
        }
      }
    }

    // Position Lightbox
    const top = scrollY + this.options.positionFromTop;
    const left = scrollX;
    const { lightbox } = this;
    lightbox.style.top = `${top}px`;
    lightbox.style.left = `${left}px`;
    lightbox.style.display = 'block';
    lightbox.animate(
      { opacity: [0, 1] },
      { duration: this.options.fadeDuration }
    );

    // Disable scrolling of the page while open
    if (this.options.disableScrolling) {
      document.body.classList.add('lb-disable-scrolling');
    }

    this.changeImage(imageNumber);
  }

  // Hide most UI elements in preparation for the animated resizing of the lightbox.
  changeImage(imageNumber) {
    const filename = this.album[imageNumber].link;
    const filetype = filename.split('.').slice(-1)[0];
    const { image, overlay, loader } = this;

    // Disable keyboard nav during transitions
    this.disableKeyboardNav();

    // Show loading state
    overlay.style.display = 'block';
    overlay.animate(
      { opacity: [0, 0.8] },
      {
        duration: this.options.fadeDuration
      }
    );
    loader.style.display = 'block';
    loader.animate({ opacity: [0, 1] }, { duration: 600 });
    for (const element of [
      image,
      this.nav,
      this.prev,
      this.next,
      this.dataContainer,
      this.caption
    ]) {
      element.style.display = 'none';
    }
    this.outerContainer.classList.add('animating');

    // When image to show is preloaded, we send the width and height to sizeContainer()
    const preloader = new Image();
    preloader.onload = () => {
      image.alt = this.album[imageNumber].alt;
      image.src = filename;

      let { width, height } = preloader;

      // Calculate the max image dimensions for the current viewport.
      // Take into account the border around the image and an additional 10px gutter on each side.
      let maxImageWidth =
        innerWidth -
        this.containerPadding.left -
        this.containerPadding.right -
        this.imageBorderWidth.left -
        this.imageBorderWidth.right -
        20;
      let maxImageHeight =
        innerHeight -
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
        width = maxImageWidth;
        height = maxImageHeight;
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
          width = maxImageWidth;
          height = Math.floor(
            preloader.height / (preloader.width / maxImageWidth)
          );
        } else {
          height = maxImageHeight;
          width = Math.floor(
            preloader.width / (preloader.height / maxImageHeight)
          );
        }
      }
      image.style.width = `${width}px`;
      image.style.height = `${height}px`;
      this.sizeContainer(width, height);
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
      this.overlay.style.width = `${innerWidth}px`;
      this.overlay.style.height = `${innerHeight}px`;
    }, 0);
  }

  /**
   * Animate the size of the lightbox to fit the image we are showing
   * This method also shows the the image.
   * @param {number} imageWidth
   * @param {number} imageHeight
   */
  sizeContainer(imageWidth, imageHeight) {
    const { outerContainer } = this;
    const oldWidth = outerContainer.offsetWidth;
    const oldHeight = outerContainer.offsetHeight;
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
      this.dataContainer.style.width = `${newWidth}px`;

      // Set focus on one of the two root nodes so keyboard events are captured.
      this.overlay.focus();

      this.showImage();
    };

    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      outerContainer
        .animate(
          [
            {
              width: `${newWidth}px`,
              height: `${newHeight}px`
            }
          ],
          { duration: this.options.resizeDuration }
        )
        .addEventListener(
          'finish',
          () => {
            outerContainer.style.width = `${newWidth}px`;
            outerContainer.style.height = `${newHeight}px`;
            postResize();
          },
          { once: true, passive: true }
        );
    } else {
      postResize();
    }
  }

  // Display the image and its details and begin preload neighboring images.
  showImage() {
    const { image } = this;
    this.loader.style.display = 'none';
    image.style.display = 'block';
    image.animate(
      { opacity: [0, 1] },
      { duration: this.options.imageFadeDuration }
    );

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

    const { nav, prev, next, album, currentImageIndex } = this;

    nav.style.display = '';

    if (album.length > 1) {
      if (this.options.wrapAround) {
        if (alwaysShowNav) {
          prev.style.opacity = '1';
          next.style.opacity = '1';
        }
        prev.style.display = 'block';
        next.style.display = 'block';
      } else {
        if (currentImageIndex > 0) {
          prev.style.display = 'block';
          if (alwaysShowNav) {
            prev.style.opacity = '1';
          }
        }
        if (currentImageIndex < album.length - 1) {
          next.style.display = 'block';
          if (alwaysShowNav) {
            next.style.opacity = '1';
          }
        }
      }
    }
  }

  // Display caption, image number, and closing button.
  updateDetails() {
    const { album, currentImageIndex, number, dataContainer } = this;
    // Enable anchor clicks in the injected caption html.
    // Thanks Nate Wright for the fix. @https://github.com/NateWr
    const { title } = album[currentImageIndex];
    if (title !== void 0 && title !== '') {
      const { caption } = this;
      if (this.options.sanitizeTitle) {
        caption.textContent = title;
      } else {
        caption.innerHTML = title;
      }
      caption.style.display = 'block';
      caption.animate({ opaticy: [0, 1] }, { duration: 200 });
    }

    if (album.length > 1 && this.options.showImageNumberLabel) {
      const labelText = this.imageCountLabel(
        currentImageIndex + 1,
        album.length
      );
      number.textContent = labelText;
      number.style.display = 'block';
      number.animate({ opaticy: [0, 1] }, { duration: 200 });
    } else {
      number.style.display = 'none';
    }

    this.outerContainer.classList.remove('animating');

    dataContainer.style.display = 'block';
    dataContainer
      .animate({ opaticy: [0, 1] }, { duration: this.options.resizeDuration })
      .addEventListener('finish', this.sizeOverlayBind, {
        once: true,
        passive: true
      });
  }

  /**
   * Preload previous and next images in set.
   */
  preloadNeighboringImages() {
    const { album, currentImageIndex } = this;
    if (album.length > currentImageIndex + 1) {
      const preloadNext = new Image();
      preloadNext.src = album[currentImageIndex + 1].link;
    }
    if (currentImageIndex > 0) {
      const preloadPrev = new Image();
      preloadPrev.src = album[currentImageIndex - 1].link;
    }
  }

  enableKeyboardNav() {
    this.lightbox.addEventListener('keyup', this.keyboardActionBind, {
      passive: true
    });
    this.overlay.addEventListener('keyup', this.keyboardActionBind, {
      passive: true
    });
  }

  disableKeyboardNav() {
    this.lightbox.removeEventListener('keyup', this.keyboardActionBind);
    this.overlay.removeEventListener('keyup', this.keyboardActionBind);
  }

  /** @param {KeyboardEvent} event */
  keyboardAction(event) {
    const { key } = event;
    if (key === 'Escape') {
      // Prevent bubbling so as to not affect other components on the page.
      event.stopPropagation();
      this.end();
    } else if (key === 'ArrowLeft') {
      if (this.currentImageIndex !== 0) {
        this.changeImage(this.currentImageIndex - 1);
      } else if (this.options.wrapAround && this.album.length > 1) {
        this.changeImage(this.album.length - 1);
      }
    } else if (key === 'ArrowRight') {
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
    window.removeEventListener('resize', this.sizeOverlayBind);
    const duration = this.options.fadeDuration;
    for (const element of [this.lightbox, this.overlay]) {
      element.animate({ opacity: 0 }, { duration }).addEventListener(
        'finish',
        () => {
          element.style.display = 'none';
        },
        { once: true, passive: true }
      );
    }

    if (this.options.disableScrolling) {
      document.body.classList.remove('lb-disable-scrolling');
    }
  }
}

export const lightbox = new Lightbox();
export { lightbox as default };
