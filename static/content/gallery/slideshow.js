/* jQuery Plugin version: Settings duration and shuffle  */

(function( $ ){
      $.fn.slideshow = function(options) {
        var settings = {
          'duration'  : 8000,
          'shuffle' : false
        };
        return this.each(function() {        
              // If options exist, lets merge them
              // with our default settings
            if ( options ) { 
                $.extend( settings, options );
            }
            var element = $(this);
            function timer() {
                var active = element.children('div.active');

                if ( active.length == 0 ) active = element.children('div:last');            
                var next =  active.next().length ? active.next()
                    : element.children('div:first');
                if (settings.shuffle) {
                    var sibs  = active.siblings();
                    var rndNum = Math.floor(Math.random() * sibs.length );
                    next  = $( sibs[ rndNum ] );    
                }
                active.addClass('last-active');
            
                next.css({opacity: 0.0})
                    .addClass('active')
                    .animate({opacity: 1.0}, 1000, function() {
                        active.removeClass('active last-active');
                });
            }
            element.timer = setInterval(timer, settings.duration);
        });
    };
    
})( jQuery );

/* Remove this line if you use a custom handler: */

$('.simple.slideshow').slideshow();

/*
 A Custom handler is used like this:
 
<script type="text/javascript">
    SQ.add(function(){
        $('#sidebarlg').slideshow(
            {                
              'duration'  : 8000,
              'shuffle' : false 
            });
    }); 
</script>
*/