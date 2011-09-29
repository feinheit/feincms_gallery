/*
 * jQuery Panel Gallery
 * @author admin@catchmyfame.com - http://www.catchmyfame.com
 * @version 2.0.0
 * @date September 10, 2010
 * @category jQuery plugin
 * @copyright (c) 2010 admin@catchmyfame.com (www.catchmyfame.com)
 * @license CC Attribution-Share Alike 3.0 - http://creativecommons.org/licenses/by-sa/3.0/
 */
 
jQuery.extend( jQuery.easing,
{
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	}
});

(function($){
	$.fn.extend({ 
		panelGallery: function(options)
		{
			var defaults = 
			{
				viewDuration: 4000,
				transitionDuration: 1000,
				boxSize:  35,
				boxFadeDuration: 1000,
				boxTransitionDuration: 100,
				panelWidth: 40,
				panelTransitionDuration: 100,
				pauseOnHover: true,
				FX: new Array()
			};
		var options = $.extend(defaults, options);

    	return this.each(function() {
    		var randID = Math.round(Math.random()*100000000);
			var o=options;
			var obj = $(this);
			
			var numImages = $('img', obj).length;
			var imgDimensions = { width:$('img:first', obj).width(), height:$('img:first', obj).height() };
			var currentImage = 0;
			var imageArray = new Array();
			var imageNameArray = new Array();
			var timeout;
			var firstTime = true; // special case for pausing the first image.
			var mouseover = false;
			
			$(obj).width(imgDimensions.width).height(imgDimensions.height).css({'position':'relative','overflow':'hidden'});
			$('img', obj).each(function(){
				imageArray.push($(this).attr('src'));
				imageNameArray.push($(this).attr('name'));
				$(this).remove();
			});

			if(o.pauseOnHover)
			{
				$(obj).mouseenter(function(){
					mouseover = true;
					clearTimeout(timeout);
					$(this).css({'cursor':'wait'});
				}).mouseleave(function(){
					mouseover = false;
					timeout=setTimeout(function(){
						if(!firstTime)
						{
							imageArray.push(imageArray.shift()); // moves first array element to last spot
							imageNameArray.push(imageNameArray.shift()); // moves first array element to last spot
						}
						$('img',obj).remove(); 
						pickFX();
					},o.viewDuration);
				});
			}

			$(obj).css({'background':'#666 url("loading.gif") no-repeat 50% 50%'}).append('<img src="'+imageArray[0]+'">');
			timeout=setTimeout(function(){pickFX()},o.viewDuration); // Start the show

			function galleryFX(name,opt1)
			{
				if(name=='fade')
				{
					$('img', obj).remove();
					$(obj).append('<img src="'+imageArray[0]+'"><img src="'+imageArray[1]+'">');
					$('img:eq(1)',obj).css({'position':'absolute','top':'0','left':'0'}).hide().fadeIn(o.transitionDuration);
					cleanupAndProceed();
				}
				if(name=='boxSouthWest' || name=='boxSouthEast' || name=='boxNorthWest' || name=='boxNorthEast' || name=='boxRandom')
				{
					var rows = Math.floor(imgDimensions.height/o.boxSize);
					var cols = Math.floor(imgDimensions.width/o.boxSize);
					var boxes = new Array();
					for(r=0;r<=rows;r++)
					{
						for(c=0;c<=cols;c++)
						{
							boxLeft=c*o.boxSize;
							boxTop=r*o.boxSize;
							$(obj).append('<div id="r'+r+'c'+c+'_'+randID+'" class="box" style="top:'+boxTop+'px;left:'+boxLeft+'px;background-position:-'+boxLeft+'px -'+boxTop+'px"></div>');
							boxes.push('r'+r+'c'+c+'_'+randID);
						}
					}
					$('.box',obj).css({'position':'absolute','background-image':'url('+imageArray[currentImage+1]+')'}).width(o.boxSize).height(o.boxSize).hide();
					// Done building matrix
					$(obj).append('<img src="'+imageArray[currentImage]+'">');
			
					if(name=='boxRandom')
					{
						boxes.shuffle();
						function boxRandom()
						{
							if(boxes.length>0)
							{
								box = boxes.shift();
								$('#'+box).fadeIn(o.boxFadeDuration);
								setTimeout(boxRandom,o.boxTransitionDuration/10);
								return;
							}
							cleanupAndProceed(o.boxFadeDuration);
						}
						boxRandom();		
					}	
			
					if(name=='boxSouthEast')
					{
							var total=0;
							function boxSouthEast()
							{
								for(var x=0;x<=total;x++)
								{
									for(var y=0;y<=total;y++)
									{
										if(x+y==total) $('#r'+x+'c'+y+'_'+randID).fadeIn(o.boxFadeDuration);
									}
								}
								total++;
								if(total<=rows+cols)
								{
									setTimeout(boxSouthEast,o.boxTransitionDuration);
								}
								else
								{
									cleanupAndProceed();
								}
							}
							boxSouthEast();
					}
					if(name=='boxNorthWest')
					{
							var total=rows+cols;
							function boxNorthWest()
							{
								for(var x=total;x>=0;x--)
								{
									for(var y=total;y>=0;y--)
									{
										if(x+y==total) $('#r'+x+'c'+y+'_'+randID).fadeIn(o.boxFadeDuration);
									}
								}
								total--;
								if(total>=0)
								{
									setTimeout(boxNorthWest,o.boxTransitionDuration);
								}
								else
								{
									cleanupAndProceed();
								}
							}
							boxNorthWest();
					}
					if(name=='boxNorthEast')
					{
						var i=rows;
						function boxNorthEast()
						{
							var total = 0;
							for(var j=i;j<=rows;j++)
							{
								$('#r'+j+'c'+total+'_'+randID).fadeIn(o.boxFadeDuration);
								total++;
							}
							i--;
							if(i>=-cols) // may need to see if row or cols is greater and use the negative of the larger value
							{
								setTimeout(boxNorthEast,o.boxTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						boxNorthEast();
					}
					if(name=='boxSouthWest')
					{
						var i=cols;
						function boxSouthWest()
						{
							var total = 0;
							for(var j=i;j<=cols;j++)
							{
								$('#r'+total+'c'+j+'_'+randID).fadeIn(o.boxFadeDuration);
								total++;
							}
							i--;
							if(i>=-cols) // may need to see if row or cols is greater and use the negative of the larger value
							{
								setTimeout(boxSouthWest,o.boxTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						boxSouthWest();
					}
				}
				if(name=='panelEastTopDown' || name=='panelEastBottomUp' || name=='panelWestTopDown' || name=='panelWestBottomUp'
				 || name=='panelNorthLeftRight' || name=='panelNorthRightLeft' || name=='panelSouthLeftRight'
				 || name=='panelSouthRightLeft' || name=='panelZipperDown' || name=='panelZipperUp'
				 || name=='panelZipperLeft' || name=='panelZipperRight' || name=='panelEastTopDown'
				 || name=='panelEastBottomUp' || name=='panelWestTopDown' || name=='panelWestBottomUp'
				 || name=='panelNorthLeftRight' || name=='panelNorthRightLeft' || name=='panelSouthLeftRight'
				 || name=='panelSouthRightLeft' || name=='panelZipperDown' || name=='panelZipperUp'
				 || name=='panelZipperLeft' || name=='panelZipperRight' || name=='panelEastTopDownReveal'
				 || name=='panelEastBottomUpReveal' || name=='panelWestTopDownReveal' || name=='panelWestBottomUpReveal'
				 || name=='panelNorthLeftRightReveal' || name=='panelNorthRightLeftReveal' || name=='panelSouthLeftRightReveal'
				 || name=='panelSouthRightLeftReveal' || name=='panelTeethDown' || name=='panelTeethUp'
				 || name=='panelTeethDown' || name=='panelTeethUp' || name=='panelTeethLeft'
				 || name=='panelTeethRight' || name=='panelTeethLeft' || name=='panelTeethRight' || name=='panelTeethDownReveal'
				 || name=='panelTeethUpReveal' || name=='panelTeethLeftReveal' || name=='panelTeethRightReveal'	)
				{
					var vertPanels = Math.floor(imgDimensions.height/o.panelWidth);
					var horizPanels = Math.floor(imgDimensions.width/o.panelWidth);
			
					for(var h=0;h<=horizPanels;h++)
					{
						panelLeft=h*o.panelWidth;
						$(obj).append('<div id="top_'+h+'_'+randID+'" class="horizPanel" style="top:-'+imgDimensions.height+'px;left:'+panelLeft+'px;background-position:-'+panelLeft+'px -'+0+'px"></div>');
						$(obj).append('<div id="bottom_'+h+'_'+randID+'" class="horizPanel" style="top:'+imgDimensions.height+'px;left:'+panelLeft+'px;background-position:-'+panelLeft+'px -'+0+'px"></div>');
					}
					for(var v=0;v<=vertPanels;v++)
					{
						panelTop=v*o.panelWidth;
						$(obj).append('<div id="left_'+v+'_'+randID+'" class="vertPanel" style="top:'+panelTop+'px;left:-'+imgDimensions.width+'px;background-position:-'+0+'px -'+panelTop+'px"></div>');
						$(obj).append('<div id="right_'+v+'_'+randID+'" class="vertPanel" style="top:'+panelTop+'px;left:'+imgDimensions.width+'px;background-position:-'+0+'px -'+panelTop+'px"></div>');
					}
					$('.horizPanel',obj).css({'position':'absolute','background-image':'url('+imageArray[currentImage+1]+')'}).width(o.panelWidth).height(imgDimensions.height);
					$('.vertPanel',obj).css({'position':'absolute','background-image':'url('+imageArray[currentImage+1]+')'}).width(imgDimensions.width).height(o.panelWidth);
					if(opt1)
					{
						$('.horizPanel',obj).css('opacity','0');
						$('.vertPanel',obj).css('opacity','0');
					}
					// Done building panels
					$(obj).append('<img src="'+imageArray[currentImage]+'">');
	
					if(name=='panelEastTopDown' || name=='panelEastBottomUp' || name=='panelWestTopDown' || name=='panelWestBottomUp' || name===undefined)
					{
						var i = (name=='panelEastTopDown' || name=='panelWestTopDown' || name===undefined) ? 0:vertPanels;
						function slideLeft()
						{
							if(name=='panelEastTopDown' || name=='panelEastBottomUp')
							{
								$('#right_'+i+'_'+randID).animate({left:'0',opacity:'1'});
							}
							else
							{
								$('#left_'+i+'_'+randID).animate({left:'0',opacity:'1'})
							}
							i = (name=='panelEastTopDown' || name=='panelWestTopDown' || name===undefined) ? i+1:i-1;
							if( (name=='panelEastTopDown' || name=='panelWestTopDown' || name===undefined) && i<=vertPanels)
							{
								setTimeout(slideLeft,o.panelTransitionDuration);
							}
							else if( (name=='panelEastBottomUp' || name=='panelWestBottomUp') && i>=0)
							{
								setTimeout(slideLeft,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}				
						}
						slideLeft();
					}
					if(name=='panelNorthLeftRight' || name=='panelNorthRightLeft' || name=='panelSouthLeftRight' || name=='panelSouthRightLeft')
					{
						var i = (name=='panelNorthLeftRight' || name=='panelSouthLeftRight') ? 0:horizPanels;
						function slideDown()
						{
							if(name=='panelNorthLeftRight' || name=='panelNorthRightLeft')
							{
								$('#top_'+i+'_'+randID).animate({top:'0',opacity:'1'});
							}
							else
							{
								$('#bottom_'+i+'_'+randID).animate({top:'0',opacity:'1'});				
							}
							i = (name=='panelNorthLeftRight' || name=='panelSouthLeftRight') ? i+1:i-1;
							if( (name=='panelNorthLeftRight' || name=='panelSouthLeftRight') && i<=horizPanels)
							{
								setTimeout(slideDown,o.panelTransitionDuration);
							}
							else if( (name=='panelNorthRightLeft' || name=='panelSouthRightLeft') && i>=0)
							{
								setTimeout(slideDown,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						slideDown();
					}
					if(name=='panelZipperDown' || name=='panelZipperUp')
					{
						// alternate left and right panels
						var zip = 'left';
						var i = (name=='panelZipperDown') ? 0:vertPanels;
						function zipper1()
						{
							if(zip=='left') $('#left_'+i+'_'+randID).animate({left:'0',opacity:'1'});
							if(zip=='right') $('#right_'+i+'_'+randID).animate({left:'0',opacity:'1'});
							i = (name=='panelZipperDown') ? i+1:i-1;
							zip = (zip=='left') ? 'right':'left';
							if( (name=='panelZipperDown') && i<=vertPanels)
							{
								setTimeout(zipper1,o.panelTransitionDuration);
							}
							else if( name=='panelZipperUp' && i>=0)
							{
								setTimeout(zipper1,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						zipper1();
					}
					if(name=='panelZipperLeft' || name=='panelZipperRight')
					{
						// alternate left and right panels
						var zip = 'top';
						var i = (name=='panelZipperLeft') ? 0:horizPanels;
						function zipper2()
						{
							if(zip=='top') $('#top_'+i+'_'+randID).animate({top:'0',opacity:'1'});
							if(zip=='bottom') $('#bottom_'+i+'_'+randID).animate({top:'0',opacity:'1'});
							i = (name=='panelZipperLeft') ? i+1:i-1;
							zip = (zip=='top') ? 'bottom':'top';
							if( (name=='panelZipperLeft') && i<=horizPanels)
							{
								setTimeout(zipper2,o.panelTransitionDuration);
							}
							else if( name=='panelZipperRight' && i>=0)
							{
								setTimeout(zipper2,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						zipper2();
					}
					if(name=='panelEastTopDownReveal' || name=='panelEastBottomUpReveal' || name=='panelWestTopDownReveal' || name=='panelWestBottomUpReveal')
					{
						$('.horizPanel',obj).remove();
						$('.vertPanel',obj).css({'left':'0','opacity':'1','background-image':'url('+imageArray[currentImage]+')'});
						$('img',obj).attr('src',imageArray[currentImage+1]);
						var i = (name=='panelEastTopDownReveal' || name=='panelWestTopDownReveal') ? 0:vertPanels;
						function slideLeftReveal()
						{
							$('#left_'+i+'_'+randID).remove();
							if(name=='panelEastTopDownReveal' || name=='panelEastBottomUpReveal')
							{
								$('#right_'+i+'_'+randID).animate({left:imgDimensions.width+'px'});			
							}
							else
							{
								$('#right_'+i+'_'+randID).animate({left:'-'+imgDimensions.width+'px'});	
							}
							i = (name=='panelEastTopDownReveal' || name=='panelWestTopDownReveal') ? i+1:i-1;
							if( (name=='panelEastTopDownReveal' || name=='panelWestTopDownReveal') && i<=vertPanels)
							{
								setTimeout(slideLeftReveal,o.panelTransitionDuration);
							}
							else if( (name=='panelEastBottomUpReveal' || name=='panelWestBottomUpReveal') && i>=0)
							{
								setTimeout(slideLeftReveal,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						slideLeftReveal();
					}
					if(name=='panelNorthLeftRightReveal' || name=='panelNorthRightLeftReveal' || name=='panelSouthLeftRightReveal' || name=='panelSouthRightLeftReveal')
					{
						$('.vertPanel',obj).remove();
						$('.horizPanel',obj).css({'top':'0','opacity':'1','background-image':'url('+imageArray[currentImage]+')'});
						$('img',obj).attr('src',imageArray[currentImage+1]);
						var i = (name=='panelNorthLeftRightReveal' || name=='panelSouthLeftRightReveal') ? 0:horizPanels;
						function slideUpReveal()
						{
							$('#bottom_'+i+'_'+randID).remove();
							if(name=='panelSouthLeftRightReveal' || name=='panelSouthRightLeftReveal')
							{
								$('#top_'+i+'_'+randID).animate({top:imgDimensions.height+'px'});			
							}
							else
							{
								$('#top_'+i+'_'+randID).animate({top:'-'+imgDimensions.height+'px'});	
							}
							i = (name=='panelNorthLeftRightReveal' || name=='panelSouthLeftRightReveal') ? i+1:i-1;
							if( (name=='panelNorthLeftRightReveal' || name=='panelSouthLeftRightReveal') && i<=horizPanels)
							{
								setTimeout(slideUpReveal,o.panelTransitionDuration);
							}
							else if( (name=='panelNorthRightLeftReveal' || name=='panelSouthRightLeftReveal') && i>=0)
							{
								setTimeout(slideUpReveal,o.panelTransitionDuration);
							}
							else
							{	
								cleanupAndProceed();
							}
						}
						slideUpReveal();
					}
					if(name=='panelTeethDown' || name=='panelTeethUp')
					{
						$('.horizPanel',obj).remove();
						var i = (name=='panelTeethDown') ? 0:vertPanels;
						function teeth1()
						{
							var v=i*o.panelWidth;
							$('#left_'+i+'_'+randID).css('background-position',imgDimensions.width/2+'px -'+v+'px').animate({left:'-'+imgDimensions.width/2+'px',opacity:'1'});
							$('#right_'+i+'_'+randID).css('background-position','-'+imgDimensions.width/2+'px -'+v+'px').animate({left:imgDimensions.width/2+'px',opacity:'1'});
							i = (name=='panelTeethDown') ? i+1:i-1;
							if( (name=='panelTeethDown') && i<=vertPanels)
							{
								setTimeout(teeth1,o.panelTransitionDuration);
							}
							else if( name=='panelTeethUp' && i>=0)
							{
								setTimeout(teeth1,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						teeth1();
						return;
					}
					if(name=='panelTeethLeft' || name=='panelTeethRight')
					{		
						$('.vertPanel',obj).remove();
						var i = (name=='panelTeethLeft') ? 0:horizPanels;
						function teeth2()
						{
							var h=i*o.panelWidth;
							$('#top_'+i+'_'+randID).css('background-position','-'+h+'px '+imgDimensions.height/2+'px').animate({top:'-'+imgDimensions.height/2+'px',opacity:'1'});
							$('#bottom_'+i+'_'+randID).css('background-position','-'+h+'px '+'-'+imgDimensions.height/2+'px').animate({top:imgDimensions.height/2+'px',opacity:'1'});
							i = (name=='panelTeethLeft') ? i+1:i-1;
							if( (name=='panelTeethLeft') && i<=horizPanels)
							{
								setTimeout(teeth2,o.panelTransitionDuration);
							}
							else if( name=='panelTeethRight' && i>=0)
							{
								setTimeout(teeth2,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						teeth2();
						return;
					}
					if(name=='panelTeethDownReveal' || name=='panelTeethUpReveal')
					{
						$('.horizPanel',obj).remove();
						var i = (name=='panelTeethDownReveal') ? 0:vertPanels;
						$('.vertPanel',obj).css({'background-image':'url('+imageArray[currentImage]+')','opacity':'1'});
						$('img',obj).attr('src',imageArray[currentImage+1]);
						for(var j=0;j<=vertPanels;j++)
						{
							$('#left_'+j+'_'+randID).css({'left':'-'+imgDimensions.width/2+'px','background-position':imgDimensions.width/2+'px -'+j*o.panelWidth+'px'});
							$('#right_'+j+'_'+randID).css({'left':imgDimensions.width/2+'px','background-position':imgDimensions.width/2+'px -'+j*o.panelWidth+'px'});	
						}
						function teeth3()
						{
							$('#left_'+i+'_'+randID).animate({left:'-'+imgDimensions.width+'px',opacity:'1'});
							$('#right_'+i+'_'+randID).animate({left:imgDimensions.width+'px',opacity:'1'});
							i = (name=='panelTeethDownReveal') ? i+1:i-1;
							if( (name=='panelTeethDownReveal') && i<=vertPanels)
							{
								setTimeout(teeth3,o.panelTransitionDuration);
							}
							else if( name=='panelTeethUpReveal' && i>=0)
							{
								setTimeout(teeth3,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						teeth3();
					}
					if(name=='panelTeethLeftReveal' || name=='panelTeethRightReveal')
					{
						$('.vertPanel',obj).remove();
						var i = (name=='panelTeethLeftReveal') ? 0:horizPanels;
						$('.horizPanel',obj).css({'background-image':'url('+imageArray[currentImage]+')','opacity':'1'});
						$('img',obj).attr('src',imageArray[currentImage+1]);
						for(var j=0;j<=horizPanels;j++)
						{
							$('#top_'+j+'_'+randID).css({'top':'-'+imgDimensions.height/2+'px','background-position':'-'+j*o.panelWidth+'px '+imgDimensions.height/2+'px'});
							$('#bottom_'+j+'_'+randID).css({'top':imgDimensions.height/2+'px','background-position':'-'+j*o.panelWidth+'px '+imgDimensions.height/2+'px'});	
						}
						function teeth4()
						{
							$('#top_'+i+'_'+randID).animate({top:'-'+imgDimensions.height+'px',opacity:'1'});
							$('#bottom_'+i+'_'+randID).animate({top:imgDimensions.height+'px',opacity:'1'});
							i = (name=='panelTeethLeftReveal') ? i+1:i-1;
							if( (name=='panelTeethLeftReveal') && i<=horizPanels)
							{
								setTimeout(teeth4,o.panelTransitionDuration);
							}
							else if( name=='panelTeethRightReveal' && i>=0)
							{
								setTimeout(teeth4,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						teeth4();
					}
				}
				if(name=='overlayTopDown' || name=='overlayBottomUp' || name=='overlayLeftRight' || name=='overlayRightLeft')
				{
					var vertPanels = Math.floor(imgDimensions.height/o.panelWidth);
					var horizPanels = Math.floor(imgDimensions.width/o.panelWidth);
					var blinds = opt1;
	
					for(var h=0;h<=horizPanels;h++)
					{
						panelLeft=h*o.panelWidth;
						$(obj).append('<div id="top_'+h+'_'+randID+'" class="horizPanel" style="top:0px;left:'+panelLeft+'px;background-position:-'+panelLeft+'px -'+0+'px"></div>');
					}
					for(v=0;v<=vertPanels;v++)
					{
						panelTop=v*o.panelWidth;
						$(obj).append('<div id="left_'+v+'_'+randID+'" class="vertPanel" style="top:'+panelTop+'px;left:0px;background-position:-'+0+'px -'+panelTop+'px"></div>');
					}
					$('.horizPanel',obj).css({'opacity':'0','position':'absolute','background-image':'url('+imageArray[currentImage+1]+')'}).width(o.panelWidth).height(imgDimensions.height);
					$('.vertPanel',obj).css({'opacity':'0','position':'absolute','background-image':'url('+imageArray[currentImage+1]+')'}).width(imgDimensions.width).height(o.panelWidth);
					// Done building panels
					$(obj).append('<img src="'+imageArray[currentImage]+'">');
					
					if(name=='overlayTopDown' || name=='overlayBottomUp')
					{
						var i = (name=='overlayTopDown') ? 0:vertPanels;
						function overlayDown()
						{
							if(blinds) $('#left_'+i+'_'+randID).height(0);		
							$('#left_'+i+'_'+randID).animate({opacity:'1',height:o.panelWidth+'px'},o.transitionDuration);
							i = (name=='overlayTopDown') ? i+1:i-1;
							if( (name=='overlayTopDown') && i<=vertPanels)
							{
								setTimeout(overlayDown,o.panelTransitionDuration);
							}
							else if( name=='overlayBottomUp' && i>=0)
							{
								setTimeout(overlayDown,o.panelTransitionDuration);
							}			
							else
							{
								cleanupAndProceed();
							}
						}
						overlayDown();
					}
					if(name=='overlayLeftRight' || name=='overlayRightLeft')
					{
						var i = (name=='overlayLeftRight') ? 0:horizPanels;
						function overlay2()
						{
							if(blinds) $('#top_'+i+'_'+randID).width(0);
							$('#top_'+i+'_'+randID).animate({opacity:'1',width:o.panelWidth+'px'},o.transitionDuration);
							i = (name=='overlayLeftRight') ? i+1:i-1;
							if( (name=='overlayLeftRight') && i<=horizPanels)
							{
								setTimeout(overlay2,o.panelTransitionDuration);
							}
							else if( name=='overlayRightLeft' && i>=0)
							{
								setTimeout(overlay2,o.panelTransitionDuration);
							}
							else
							{
								cleanupAndProceed();
							}
						}
						overlay2();
					}	
				}
				if(name=='jackpot')
				{
					for(var h=0;h<=2;h++)
					{
						var imageArrayCopy = imageArray.slice(0); // The easy way to copy an array. Equals alone clones.
						imageArrayCopy.push(imageArrayCopy.shift());
						var panelLeft=h*(imgDimensions.width/3);
						$(obj).append('<div id="top_'+h+'_'+randID+'" class="horizPanel" style="overflow:hidden;top:-'+imgDimensions.height*10+'px;left:'+panelLeft+'px;background-position:-'+panelLeft+'px -'+0+'px"></div>');
						for(var i=0;i<=9;i++)
						{
							$('#top_'+h+'_'+randID).append('<img style="position:relative;left:-'+panelLeft+'px" src="'+imageArrayCopy[0]+'"><br />');
							imageArrayCopy.push(imageArrayCopy.shift());
						}
						$('#top_'+h+'_'+randID).append('<img style="position:relative;left:-'+panelLeft+'px" src="'+imageArray[0]+'"><br />');
					}
					$('.horizPanel',obj).css({'position':'absolute','background-image':'url('+imageArray[currentImage+1]+')'}).width(imgDimensions.width/3).height(imgDimensions.height*11);
					// Done building panels
					$(obj).append('<img src="'+imageArray[currentImage]+'">');
			
					var i=0;
					function jackpot()
					{
						$('#top_'+i+'_'+randID).animate({top:'0px'}, {duration:o.transitionDuration*3, easing:'easeInOutExpo'});
						i++;
						if( i<=2)
						{
							setTimeout(jackpot,500);
						}		
						else
						{
							cleanupAndProceed(o.transitionDuration+(3*500));
						}
					}
					jackpot();
				}
			}
			function cleanupAndProceed(delay)
			{
					delay = (!delay) ? o.transitionDuration:delay;
					setTimeout( function(){
						if(!mouseover)
						{
							firstTime=false;
							$(obj).append('<img style="position:absolute;top:0;left:0" src="'+imageArray[currentImage+1]+'">');
							$('.box',obj).remove(); // Remove all div boxes - we'll rebuild them quickly
							$('.horizPanel',obj).remove(); // Remove all panels - we'll rebuild them quickly
							$('.vertPanel',obj).remove(); // Remove all panels - we'll rebuild them quickly
							timeout = setTimeout(function(){
								imageArray.push(imageArray.shift()); // moves first array element to last spot
								imageNameArray.push(imageNameArray.shift());
								$('img',obj).remove(); // Remove all images from container
								pickFX();
							},o.viewDuration);
						}
					}, delay);
			}
			function pickFX()
			{
				// If an image has a name tag then use it, else use the FX array, else random. E.g. 'panelTeethRight,fade'
				randomFXarray = new Array(
					"fade",
					"boxSouthWest",
					"boxSouthEast",
					"boxNorthWest",
					"boxNorthEast",
					"boxRandom",
					"panelEastTopDown,true",
					"panelEastBottomUp,true",
					"panelWestTopDown,true",
					"panelWestBottomUp,true",
					"panelNorthLeftRight,true",
					"panelNorthRightLeft,true",
					"panelSouthLeftRight,true",
					"panelSouthRightLeft,true",
					"panelZipperDown,true",
					"panelZipperUp,true",
					"panelZipperLeft,true",
					"panelZipperRight,true",
					"panelEastTopDown,false",
					"panelEastBottomUp,false",
					"panelWestTopDown,false",
					"panelWestBottomUp,false",
					"panelNorthLeftRight,false",
					"panelNorthRightLeft,false",
					"panelSouthLeftRight,false",
					"panelSouthRightLeft,false",
					"panelZipperDown,false",
					"panelZipperUp,false",
					"panelZipperLeft,false",
					"panelZipperRight,false",
					"panelEastTopDownReveal",
					"panelEastBottomUpReveal",
					"panelWestTopDownReveal",
					"panelWestBottomUpReveal",
					"panelNorthLeftRightReveal",
					"panelNorthRightLeftReveal",
					"panelSouthLeftRightReveal",
					"panelSouthRightLeftReveal",
					"panelTeethDown,true",
					"panelTeethUp,true",
					"panelTeethDown,false",
					"panelTeethUp,false",
					"panelTeethLeft,true",
					"panelTeethRight,true",
					"panelTeethLeft,false",
					"panelTeethRight,false",
					"panelTeethDownReveal",
					"panelTeethUpReveal",
					"panelTeethLeftReveal",
					"panelTeethRightReveal",
					"overlayTopDown,true",
					"overlayBottomUp,true",
					"overlayLeftRight,true",
					"overlayRightLeft,true",
					"overlayTopDown,false",
					"overlayBottomUp,false",
					"overlayLeftRight,false",
					"overlayRightLeft,false",
					"jackpot"
				);
		
				var randFX = Math.floor(Math.random() * randomFXarray.length);
				
				if(imageNameArray[0]) opt = imageNameArray[0];  // e.g. 'panelTeethRight,fade'
				else if(o.FX.length>0) { opt=o.FX[0]; o.FX.push(o.FX.shift()); }
				else opt=randomFXarray[randFX];				
				
				opt1 = opt.split(',');
				bool = (opt1[1]=='true') ? true:false;
				str = {name:opt1[0],opt1:bool};
				galleryFX(str.name,str.opt1);
			}
 		});
	}
	});
})(jQuery);

Array.prototype.shuffle = function() {
	var s = [];
	while (this.length) s.push(this.splice(Math.random() * this.length, 1));
	while (s.length) this.push(s.pop());
	return this;
}