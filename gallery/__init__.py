# coding=utf-8
"""
Usage
=====

Add :mod:`feinheit.gallery` to your :mod:`settings.INSTALLED_APPS`

Create the content type in your models.py::

    Page.create_content_type(GalleryContent, TYPE_CHOICES=GALLERY_TYPE_CHOICES,
                         FORM_MEDIA_DICT=FORM_MEDIA_DICT, regions=('main', 'moodboard'))


The TYPE_CHOICES and the FORM_MEDIA_DICT are optional. As well as the regions attribute.


Type Choices example::

    GALLERY_TYPE_CHOICES = (
                       #('p.classic' , _('Classic Gallery with full size lightbox.')),
                       #('p.clasiccaption' , _('Classic Gallery with caption and full size lightbox.')),
                       #('p.classiclm' , _('Classic Gallery with Lightbox.')),
                       #('p.classiclmcaption' , _('Classic Gallery with caption and Lightbox.')),
                       #('carousel', _('Single line Strip Board')),
                       #('panel', _('Fancy Panel')),
                       ('product', _('Projektgalerie')),
                       ('slideshow', _('Moodboard')),
                       ('overview', _(u'Übersicht')),
                       

Media dict example::

    standard_gallery_media = {'css':{'all':('content/gallery/classic.css',)}}

    FORM_MEDIA_DICT = {'gallery': {'css': {'all': ('lib/fancybox/jquery.fancybox-1.3.1.css', )},
                                              'js': ('lib/fancybox/jquery.fancybox-1.3.1.pack.js', '/media/content/gallery/gallery.js')},
                    'gallery_slideshow': {'css':{'all':('/media/content/gallery/slideshow.css',)},
                                                     'js':('content/gallery/slideshow.js',)},
                    'gallery_panel': {'js':('content/gallery/jquery.panelgallery-2.0.0.min.js','content/gallery/panelgallery.js')},
                    'gallery_product': {'css':{'all':('/media/content/gallery/product.css','/media/content/gallery/anythingslider.css',
                                                      '/media/content/gallery/anythingslider-ie.css')},
                                                     'js':('/media/content/gallery/jquery.anythingslider.min.js','/media/content/gallery/product.js',)},
                                    
    }
    
By default the css and javascript files for the galleries are taken from the static folder 
and should not be altered. To customize a gallery move the media files to your media folder and
adjust the path in the FORM_MEDIA_DICT.

When replacing an image file in the admin frontend, you have to save the page for the thumbnail
to update itself.

"""
