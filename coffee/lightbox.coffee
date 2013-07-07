###
Lightbox v2.6
by Lokesh Dhakar - http://www.lokeshdhakar.com

For more information, visit:
http://lokeshdhakar.com/projects/lightbox2/

Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
- free for use in both personal and commercial projects
- attribution requires leaving author name, author link, and the license info intact

###


# Use local alias
$ = jQuery


class LightboxOptions
  constructor: ->
    @fadeDuration         = 500
    @fitImagesInViewport  = true 
    @resizeDuration       = 700
    @showImageNumberLabel = true
    @wrapAround           = false

  # Change to localize to non-english language
  albumLabel: (curImageNum, albumSize) ->
      "Image #{curImageNum} of #{albumSize}"


class Lightbox
  constructor: (@options) ->
    @album             = []
    @currentImageIndex = undefined
    @init()


  init: ->
    @enable()
    @build()


  # Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
  # that contain 'lightbox'. When these are clicked, start lightbox.
  enable: ->
    $('body').on 'click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', (e) =>
      @start $(e.currentTarget)
      false


  # Build html for the lightbox and the overlay.
  # Attach event handlers to the new DOM elements. click click click
  build: ->
    $("<div id='lightboxOverlay' class='lightboxOverlay'></div><div id='lightbox' class='lightbox'><div class='lb-outerContainer'><div class='lb-container'><img class='lb-image' src='' /><div class='lb-nav'><a class='lb-prev' href='' ></a><a class='lb-next' href='' ></a></div><div class='lb-loader'><a class='lb-cancel'></a></div></div></div><div class='lb-dataContainer'><div class='lb-data'><div class='lb-details'><span class='lb-caption'></span><span class='lb-number'></span></div><div class='lb-closeContainer'><a class='lb-close'></a></div></div></div></div>").appendTo($('body'));

    # Cache jQuery objects
    @$lightbox       = $('#lightbox')
    @$overlay        = $('#lightboxOverlay')
    @$outerContainer = @$lightbox.find('.lb-outerContainer')

    # Store css values for future lookup
    @$container             = @$lightbox.find('.lb-container')
    @containerTopPadding    = parseInt @$container.css('padding-top'), 10
    @containerRightPadding  = parseInt @$container.css('padding-right'), 10
    @containerBottomPadding = parseInt @$container.css('padding-bottom'), 10
    @containerLeftPadding   = parseInt @$container.css('padding-left'), 10

    # Attach event handlers to the newly minted DOM elements
    @$overlay
      .hide()
      .on 'click', () =>
        @end()
        return false

    @$lightbox
      .hide()
      .on 'click', (e) =>
        if $(e.target).attr('id') == 'lightbox' then @end()
        return false

    @$outerContainer.on 'click', (e) =>
      if $(e.target).attr('id') == 'lightbox' then @end()
      return false

    @$lightbox.find('.lb-prev').on 'click', () =>
      if @currentImageIndex == 0
        @changeImage @album.length - 1
      else
        @changeImage @currentImageIndex - 1
      return false

    @$lightbox.find('.lb-next').on 'click', () =>
      if @currentImageIndex == @album.length - 1
        @changeImage 0
      else
        @changeImage @currentImageIndex + 1
      return false

    @$lightbox.find('.lb-loader, .lb-close').on 'click', () =>
      @end()
      return false


  # Show overlay and lightbox. If the image is part of a set, add siblings to album array.
  start: ($link) ->
    $(window).on "resize", @sizeOverlay

    $('select, object, embed').css visibility: "hidden"
    @$overlay
      .width( $(document).width())
      .height( $(document).height() )
      .fadeIn( @options.fadeDuration )

    @album = []
    imageNumber = 0

    # Supporting both data-lightbox attribute and rel attribute implementations
    dataLightboxValue = $link.attr 'data-lightbox'
    if dataLightboxValue
      for a, i in $( $link.prop("tagName") + '[data-lightbox="' + dataLightboxValue + '"]')
        @album.push link: $(a).attr('href'), title: $(a).attr('title')
        if $(a).attr('href') == $link.attr('href')
          imageNumber = i
    else 
      if $link.attr('rel') == 'lightbox'
        # If image is not part of a set
        @album.push link: $link.attr('href'), title: $link.attr('title')
      else
        # Image is part of a set
        for a, i in $( $link.prop("tagName") + '[rel="' + $link.attr('rel') + '"]')
          @album.push link: $(a).attr('href'), title: $(a).attr('title')
          if $(a).attr('href') == $link.attr('href')
            imageNumber = i

    # Position lightbox
    $window = $(window)
    top     = $window.scrollTop() + $window.height()/10
    left    = $window.scrollLeft()
    @$lightbox
      .css
        top: top + 'px'
        left: left + 'px'
      .fadeIn( @options.fadeDuration)

    @changeImage(imageNumber)
    return


  # Hide most UI elements in preparation for the animated resizing of the lightbox.
  changeImage: (imageNumber) ->

    @disableKeyboardNav()
    $image = @$lightbox.find('.lb-image')

    @sizeOverlay()
    @$overlay.fadeIn( @options.fadeDuration )

    $('.lb-loader').fadeIn 'slow'
    @$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide()

    @$outerContainer.addClass 'animating'

    # When image to show is preloaded, we send the width and height to sizeContainer()
    preloader = new Image()
    preloader.onload = () =>
      $image.attr 'src', @album[imageNumber].link
      
      $preloader = $(preloader)

      $image.width preloader.width
      $image.height preloader.height

      if @options.fitImagesInViewport
        # Fit image inside the viewport.
        # Take into account the border around the image and an additional 10px gutter on each side.
        windowWidth    = $(window).width()
        windowHeight   = $(window).height()
        maxImageWidth  = windowWidth - @containerLeftPadding - @containerRightPadding - 20
        maxImageHeight = windowHeight - @containerTopPadding - @containerBottomPadding - 110
        
        # Is there a fitting issue at all?
        if (preloader.width > maxImageWidth) || (preloader.height > maxImageHeight)
          # Use the highest scaling factor to determine which side of the image the scaling is based on
          if (preloader.width / maxImageWidth) > (preloader.height / maxImageHeight)
            imageWidth  = maxImageWidth
            imageHeight = parseInt (preloader.height / (preloader.width/imageWidth)), 10
            $image.width imageWidth
            $image.height imageHeight
          else
            imageHeight = maxImageHeight
            imageWidth  = parseInt (preloader.width / (preloader.height/imageHeight)), 10
            $image.width imageWidth
            $image.height imageHeight

      @sizeContainer $image.width(), $image.height()

    preloader.src = @album[imageNumber].link
    @currentImageIndex = imageNumber
    return


  # Stretch overlay to fit the document
  sizeOverlay: () ->
    $('#lightboxOverlay')
      .width($(document).width())
      .height($(document).height())


  # Animate the size of the lightbox to fit the image we are showing
  sizeContainer: (imageWidth, imageHeight) ->
    oldWidth  = @$outerContainer.outerWidth()
    oldHeight = @$outerContainer.outerHeight()
    newWidth  = imageWidth + @containerLeftPadding + @containerRightPadding
    newHeight = imageHeight + @containerTopPadding + @containerBottomPadding

    @$outerContainer.animate
      width: newWidth,
      height: newHeight
    , @options.resizeDuration, 'swing'

    # Wait for resize animation to finsh before showing the image
    setTimeout =>
      @$lightbox.find('.lb-dataContainer').width(newWidth)
      @$lightbox.find('.lb-prevLink').height(newHeight)
      @$lightbox.find('.lb-nextLink').height(newHeight)
      @showImage()
      return
    , @options.resizeDuration

    return


  # Display the image and it's details and begin preload neighboring images.
  showImage: ->
    @$lightbox.find('.lb-loader').hide()
    @$lightbox.find('.lb-image').fadeIn 'slow'

    @updateNav()
    @updateDetails()
    @preloadNeighboringImages()
    @enableKeyboardNav()

    return


  # Display previous and next navigation if appropriate.
  updateNav: ->
    @$lightbox.find('.lb-nav').show()
    
    if @album.length > 1 
      if @options.wrapAround  
        @$lightbox.find('.lb-prev, .lb-next').show()
      else 
        if @currentImageIndex > 0 then @$lightbox.find('.lb-prev').show()
        if @currentImageIndex < @album.length - 1 then @$lightbox.find('.lb-next').show()

    return

  # Display caption, image number, and closing button.
  updateDetails: ->
    if typeof @album[@currentImageIndex].title != 'undefined' && @album[@currentImageIndex].title != ""
      @$lightbox.find('.lb-caption')
        .html( @album[@currentImageIndex].title)
        .fadeIn('fast')

    if @album.length > 1 && @options.showImageNumberLabel
      @$lightbox.find('.lb-number')
        .text( @options.albumLabel(@currentImageIndex+1, @album.length) )
        .fadeIn('fast')
    else
      @$lightbox.find('.lb-number').hide()

    @$outerContainer.removeClass 'animating'

    @$lightbox.find('.lb-dataContainer')
      .fadeIn @resizeDuration, () =>
        @sizeOverlay()
    return


  # Preload previous and next images in set.
  preloadNeighboringImages: ->
   if @album.length > @currentImageIndex + 1
      preloadNext = new Image()
      preloadNext.src = @album[@currentImageIndex + 1].link

    if @currentImageIndex > 0
      preloadPrev = new Image()
      preloadPrev.src = @album[@currentImageIndex - 1].link
    return


  enableKeyboardNav: ->
    $(document).on 'keyup.keyboard', $.proxy( @keyboardAction, this)
    return


  disableKeyboardNav: ->
    $(document).off '.keyboard'
    return


  keyboardAction: (event) ->
    KEYCODE_ESC        = 27
    KEYCODE_LEFTARROW  = 37
    KEYCODE_RIGHTARROW = 39
    keycode            = event.keyCode
    key                = String.fromCharCode(keycode).toLowerCase()

    if keycode == KEYCODE_ESC || key.match(/x|o|c/)
      @end()
    else if key == 'p' || keycode == KEYCODE_LEFTARROW
      if @currentImageIndex != 0
          @changeImage @currentImageIndex - 1
    else if key == 'n' || keycode == KEYCODE_RIGHTARROW
      if @currentImageIndex != @album.length - 1
          @changeImage @currentImageIndex + 1
    return


  # Closing time. :-(
  end: ->
    @disableKeyboardNav()
    $(window).off "resize", @sizeOverlay
    @$lightbox.fadeOut @options.fadeDuration
    @$overlay.fadeOut @options.fadeDuration
    $('select, object, embed').css visibility: "visible"


$ ->
  options  = new LightboxOptions()
  lightbox = new Lightbox options
