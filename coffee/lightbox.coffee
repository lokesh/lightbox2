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
    @currentImageNumber = undefined
    @init()
    
  init: ->
    @enable()
    @build()


  enable: ->
    $('a[rel^=lightbox], area[rel^=lightbox]').on 'click', (e) =>
      @start e.currentTarget
      false


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

    $('#lightboxOverlay').on 'click', (e) =>
      @end()
      return false

    $lightbox = $('#lightbox')
    
    $lightbox.on 'click', (e) =>
      if $(e.target).attr('id') == 'lightbox' then @end()
      return false
      
    $lightbox.find('.outerContainer').on 'click', (e) =>
      if $(e.target).attr('id') == 'lightbox' then @end()
      return false
      
    $lightbox.find('.prev').on 'click', (e) =>
      @.changeImage @.currentImageNumber-1
      return false
      
    $lightbox.find('.next').on 'click', (e) =>
      @.changeImage @.currentImageNumber+1
      return false

    $lightbox.find('.loader, .close').on 'click', (e) =>
      @end()
      return false

    return


  start: (link) ->
    $('select, object, embed').css visibility: "hidden"
    $('#lightboxOverlay')
      .width( $(document).width() )
      .height( $(document).height() )
      .fadeIn( @options.fadeDuration )
    
    @album = []
    imageNumber = 0

    if link.rel == 'lightbox'
      @album.push link: link.href, title: link.title
    else
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
      .fadeIn( @options.fadeDuration)
      .css
        top: top + 'px'
        left: left + 'px'

    @changeImage(imageNumber)
    return
  
  
  
  changeImage: (imageNumber) ->
    $lightbox = $('#lightbox')
    $image = $lightbox.find('.image')
    
    $('.loader').fadeIn 'slow'
    $lightbox.find('.image, .nav, .prev, .next, .dataContainer, .numbers').hide()

    $lightbox.find('.outerContainer').addClass 'animating'
    
    preloader = new Image
    preloader.onload = () =>
      $image.attr 'src', @album[@currentImageNumber].link
      # Bug fix by Andy Scott 
      $image.width = preloader.width
      $image.height = preloader.height
      # End of bug fix
      @sizeContainer preloader.width, preloader.height

    preloader.src = @album[imageNumber].link
    @currentImageNumber = imageNumber
    
    return  
  
  
  sizeContainer: (imageWidth, imageHeight) ->
    $lightbox = $('#lightbox')
    $outerContainer = $lightbox.find('.outerContainer')
  
    oldWidth = $outerContainer.outerWidth()
    oldHeight = $outerContainer.outerHeight()
  
    # TODO - replace 20 with dynamic code that pulls border/margins/padding
    newWidth = imageWidth + 20
    newHeight = imageHeight + 20
  
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

    setTimeout =>
      $lightbox.find('.dataContainer').width(newWidth)
      $lightbox.find('.prevLink').height(newHeight)
      $lightbox.find('.nextLink').height(newHeight)
      @showImage()
      return
    , @options.resizeDuration # Image starts fading in before resize is finished
    
    return
  

  showImage: ->
    $lightbox = $('#lightbox')
    $lightbox.find('.loader').hide()
    $lightbox.find('.image').fadeIn 'slow'

    @updateNav()
    @updateDetails()
    @preloadNeighboringImages()
    @enableKeyboardNav()

    return


  updateNav: ->
    $lightbox = $('#lightbox')
    $lightbox.find('.nav').show()
    if @currentImageNumber > 0 then $lightbox.find('.prev').show();
    if @currentImageNumber < @album.length - 1 then $lightbox.find('.next').show();
    return
  
   
  updateDetails: ->
    $lightbox = $('#lightbox')
    $lightbox.find('.caption')
      .html( @album[@currentImageNumber].title)
      .fadeIn('fast')

    if @album.length > 1
      $lightbox.find('.number')
        .html( @options.labelImage + ' ' + (@currentImageNumber + 1) + ' ' + @options.labelOf + '  ' + @album.length)
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
    
    
  preloadNeighboringImages: ->
   if @album.length > @currentImageNumber + 1
      preloadNext = new Image
      preloadNext.src = @album[@currentImageNumber + 1].link

    if @currentImageNumber > 0
      preloadPrev = new Image
      preloadPrev.src = @album[@currentImageNumber - 1].link    

    return


  enableKeyboardNav: ->
    $(document).on 'keyup', $.proxy( @keyboardAction, this)
    return

  
  disableKeyboardNav: ->
    $(document).off 'keyup', @keyboardAction  
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
      if @currentImageNumber != 0
          @disableKeyboardNav()
          @changeImage @currentImageNumber - 1
    else if key == 'n' || keycode == KEYCODE_RIGHTARROW
      if @currentImageNumber != @album.length - 1
          @disableKeyboardNav()
          @changeImage @currentImageNumber + 1

    return
  
  
  end: ->
    @disableKeyboardNav()
    $('#lightbox').fadeOut 'fast'
    $('#lightboxOverlay').fadeOut 'slow'
    $('select, object, embed').css visibility: "visible"
        
    
  

$ ->
  options = new LightboxOptions
  lightbox = new Lightbox options
