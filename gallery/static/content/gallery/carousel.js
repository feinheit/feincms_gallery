$(function(){
    $('.carousel').infiniteCarousel({
        transitionSpeed: 800,
        displayTime: 6000,
        inView:3,
		displayThumbnails: false,
        imagePath: '/static/content/gallery/images/',
        advance:1,
        easeLeft: 'swing',
        easeRight:'swing',
        textholderHeight : .25,
		prevNextInternal: false,
        padding:'10px',
		autoHideCaptions: true,
        displayProgressBar: false,
		autoStart: false,
    });
    //$('div.thumb').parent().css({'margin':'0 auto','width':'600px'});
    $('.carousel a').fancybox();
});
/* for options visit: 
 * http://www.catchmyfame.com/2009/12/30/huge-updates-to-jquery-infinite-carousel-version-2-released/ 
 */
