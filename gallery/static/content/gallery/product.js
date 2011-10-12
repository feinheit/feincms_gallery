/* http://www.catchmyfame.com/2009/12/30/huge-updates-to-jquery-infinite-carousel-version-2-released/ */
$(function(){
    $('.productgallery').infiniteCarousel({
        transitionSpeed: 1200,
        displayTime: 6000,
        inView:1,
        advance:1,
        imagePath: '/static/content/gallery/images/',
        easeLeft: 'swing',
        easeRight:'swing',
        textholderHeight : .15,
        padding:'10px',
        autoHideCaptions: true,
        prevNextInternal: true,
		displayProgressBar: false,
		autoHideControls: true,
		displayThumbnailBackground: true
    });
    $('div.thumb').parent().css({'margin':'0 auto','width':'640px'});
    $('#productgalleryWrapper > div:eq(1)').css('margin-top','56px');
    $('#productgalleryWrapper > div:eq(2)').css('margin-top','56px');
});
