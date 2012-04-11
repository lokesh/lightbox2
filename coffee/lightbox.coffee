###
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

###


class LightboxOptions
  constructor: ->
    @fileLoadingImage = 'images/loading.gif'     
    @fileCloseImage = 'images/close.png'
    @resizeDuration = 700
    @fadeDuration = 500
    @labelImage = "Image" # Change to localize to non-english language
    @labelOf = "of"       


class Lightbox
  constructor: (@options) ->
    @album = []
    @currentImageIndex = undefined
    @init()
    
  
  init: ->
    @enable()
    @build()


  # Loop through anchors and areamaps looking for rel attributes that contain 'lightbox'
  # On clicking these, start lightbox.
  enable: ->
    $('a[rel^=lightbox], area[rel^=lightbox]').on 'click', (e) =>
      @start e.currentTarget
      false


  # Insert html at the bottom of the page that is used for the overlay to darken the page
  # and also for showing the image and it's details. Attach event handlers to the new DOM elements as well.
  build: ->
    $("<div>", id: 'lightboxOverlay' ).after(
      $('<div/>', id: 'lightbox').append(
        $('<div/>', class: 'outerContainer').append(
          $('<div/>', class: 'container').append(
            $('<img/>', class: 'image'),
            $('<div/>',class: 'nav').append(
              $('<a/>', class: 'prev'),
              $('<a/>', class: 'next')
            ),
            $('<div/>', class: 'loader').append(
              $('<a/>', class: 'cancel').append(
                $('<img/>', src: @options.fileLoadingImage)
              )
            )
          )
        ),
        $('<div/>', class: 'dataContainer').append(
          $('<div/>', class: 'data').append(          
            $('<div/>', class: 'details').append(
              $('<span/>', class: 'caption'),
              $('<span/>', class: 'number')
            ),
            $('<div/>', class: 'closeContainer').append(
              $('<a/>', class: 'close').append(
                $('<img/>', src: @options.fileCloseImage)
              )
            )
          )
        )
      )
    ).appendTo $('body')

    $('#lightboxOverlay')
      .hide()
      .on 'click', (e) =>
        @end()
        return false

    $lightbox = $('#lightbox')
    
    $lightbox
      .hide()
      .on 'click', (e) =>
        if $(e.target).attr('id') == 'lightbox' then @end()
        return false
      
    $lightbox.find('.outerContainer').on 'click', (e) =>
      if $(e.target).attr('id') == 'lightbox' then @end()
      return false
      
    $lightbox.find('.prev').on 'click', (e) =>
      @changeImage @currentImageIndex - 1
      return false
      
    $lightbox.find('.next').on 'click', (e) =>
      @changeImage @currentImageIndex + 1
      return false

    $lightbox.find('.loader, .close').on 'click', (e) =>
      @end()
      return false

    return

  # Show overlay and lightbox. If the image is part of a set, add siblings to album array.
  start: (link) ->
    $('select, object, embed').css visibility: "hidden"
    $('#lightboxOverlay')
      .width( $(document).width() )
      .height( $(document).height() )
      .fadeIn( @options.fadeDuration )

    @album = []
    imageNumber = 0

    if link.rel == 'lightbox'
      # If image is not part of a set
      @album.push link: link.href, title: link.title
    else
      # Image is part of a set
      for a, i in $( link.tagName+'[rel="' + link.rel + '"]')
        @album.push link: a.href, title: a.title
        if a.href == link.href
          imageNumber = i

    # Position lightbox 
    $window = $(window)
    top = $window.scrollTop() + $window.height()/10
    left = $window.scrollLeft()
    $lightbox = $('#lightbox')
    $lightbox
      .css
        opacity: 1
        scale: 1
        top: top + 'px'
        left: left + 'px'
      .fadeIn( @options.fadeDuration)
      
    @changeImage(imageNumber)
    return
  

  # Hide most UI elements in preparation for the animated resizing of the lightbox.
  changeImage: (imageNumber) ->

    @disableKeyboardNav()    

    $lightbox = $('#lightbox')
    $image = $lightbox.find('.image')

    $('.loader').fadeIn 'slow'
    $lightbox.find('.image, .nav, .prev, .next, .dataContainer, .numbers').hide()

    $lightbox.find('.outerContainer').addClass 'animating'
    
    # When image to show is preloaded, we send the width and height to sizeContainer()
    preloader = new Image
    preloader.onload = () =>
      $image.attr 'src', @album[@currentImageIndex].link
      # Bug fix by Andy Scott 
      $image.width = preloader.width
      $image.height = preloader.height
      # End of bug fix
      @sizeContainer preloader.width, preloader.height

    preloader.src = @album[imageNumber].link
    @currentImageIndex = imageNumber
    return  
  
  
  # Animate the size of the lightbox to fit the image we are showing
  sizeContainer: (imageWidth, imageHeight) ->
    $lightbox = $('#lightbox')

    $outerContainer = $lightbox.find('.outerContainer')
    oldWidth = $outerContainer.outerWidth()
    oldHeight = $outerContainer.outerHeight()

    $container = $lightbox.find('.container')
    containerTopPadding = parseInt $container.css('padding-top'), 10
    containerRightPadding = parseInt $container.css('padding-right'), 10
    containerBottomPadding = parseInt $container.css('padding-bottom'), 10
    containerLeftPadding = parseInt $container.css('padding-left'), 10        

    newWidth = imageWidth + containerLeftPadding + containerRightPadding
    newHeight = imageHeight + containerTopPadding + containerBottomPadding
  
    # Animate just the width, just the height, or both, depending on what is different
    if newWidth != oldWidth && newHeight != oldHeight
      $outerContainer.animate
        width: newWidth,
        height: newHeight
      , @options.resizeDuration, 'easeInOutCubic'
    else if newWidth != oldWidth
      $outerContainer.animate
        width: newWidth
      , @options.resizeDuration, 'easeInOutCubic'
    else if newHeight != oldHeight
      $outerContainer.animate
        height: newHeight
      , @options.resizeDuration, 'easeInOutCubic'

    # Wait for resize animation to finsh before showing the image
    setTimeout =>
      $lightbox.find('.dataContainer').width(newWidth)
      $lightbox.find('.prevLink').height(newHeight)
      $lightbox.find('.nextLink').height(newHeight)
      @showImage()
      return
    , @options.resizeDuration 
    
    return
  
  
  # Display the image and it's details and begin preload neighboring images.
  showImage: ->
    $lightbox = $('#lightbox')
    $lightbox.find('.loader').hide()
    $lightbox.find('.image').fadeIn 'slow'

    @updateNav()
    @updateDetails()
    @preloadNeighboringImages()
    @enableKeyboardNav()

    return


  # Display previous and next navigation if appropriate.
  updateNav: ->
    $lightbox = $('#lightbox')
    $lightbox.find('.nav').show()
    if @currentImageIndex > 0 then $lightbox.find('.prev').show();
    if @currentImageIndex < @album.length - 1 then $lightbox.find('.next').show();
    return
  
  
  # Display caption, image number, and closing button. 
  updateDetails: ->
    $lightbox = $('#lightbox')
    $lightbox.find('.caption')
      .html( @album[@currentImageIndex].title)
      .fadeIn('fast')

    if @album.length > 1
      $lightbox.find('.number')
        .html( @options.labelImage + ' ' + (@currentImageIndex + 1) + ' ' + @options.labelOf + '  ' + @album.length)
        .fadeIn('fast')
    else 
      $lightbox.find('.number').hide()

    $lightbox.find('.outerContainer').removeClass 'animating'
    
    $lightbox.find('.dataContainer')
      .slideDown @resizeDuration, () =>
        $('#lightboxOverlay')
          .width( $(document).width() )
          .height( $(document).height() )
    return
    
    
  # Preload previos and next images in set.  
  preloadNeighboringImages: ->
   if @album.length > @currentImageIndex + 1
      preloadNext = new Image
      preloadNext.src = @album[@currentImageIndex + 1].link

    if @currentImageIndex > 0
      preloadPrev = new Image
      preloadPrev.src = @album[@currentImageIndex - 1].link    
    return


  enableKeyboardNav: ->
    $(document).on 'keyup.keyboard', $.proxy( @keyboardAction, this)
    return

  
  disableKeyboardNav: ->
    $(document).off '.keyboard'
    return
  
    
  keyboardAction: (event) ->
    KEYCODE_ESC = 27
    KEYCODE_LEFTARROW = 37
    KEYCODE_RIGHTARROW = 39

    keycode = event.keyCode
    key = String.fromCharCode(keycode).toLowerCase()

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
    
    if Modernizr.csstransforms && Modernizr.csstransitions
      $('#lightbox').transition
        scale: '.9', opacity: 0
        duration: 500
        easing: 'linear'
        ->
          $(this).hide()
    else 
      $('#lightbox').fadeOut 'fast'

    $('#lightboxOverlay').fadeOut 'slow'
    $('select, object, embed').css visibility: "visible"
        
    
$ ->
  options = new LightboxOptions
  lightbox = new Lightbox options
