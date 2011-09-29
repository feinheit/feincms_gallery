function titleFormat(title, array, index) {
    return $(array[index]).next().clone();
}

$(function(){
    $('a[rel=lightbox], a.grouped_elements, a.image').fancybox({
            'transitionIn': 'elastic',
            'transitionOut': 'elastic',
            'easingIn': 'swing',
            'easingOut': 'swing',
            'cyclic': true,
            'width': 980,
            'height': 600,
            'autoScale': true,
            'overlayOpacity': 0.7,
            'overlayColor': '#fff',
            'padding': 10,
            'titlePosition': 'inside'
            //'titleFormat' : titleFormat
    });
});
