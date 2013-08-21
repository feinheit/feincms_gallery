===============
FeinCMS Gallery
===============

Introduction
------------
This is a gallery app and contenttype for Feincms. It allows for several gallery 'types', each with its own
tempate, css and javascript files. It comes packed with several pretty types ready for use:

* The classic grid type, with caption, lightbox image and pagination.
* Image carousel: a single line scrollable strip
* Slideshow: A simple slideshow
* Fancy panel: A fancyer slideshow with lots of different transitions
* Product gallery: One large image with smaller thumbnails. 

The CSS and Javascript files for the galleries are only loaded on demand using the form media class.

The admin frontend has thumbnail view for the gallery images and drag and drop functionality for image sorting.


Installation
------------

At this time, there is no prebundled installation file to install via pip or easy_install. So get
the source at: https://github.com/feinheit/feincms_gallery

* Make sure to add the ``gallery`` to your Python path.
* Add ``gallery`` to your ``INSTALLED_APPS`` in your ``settings.py``
* Add ``url(r'^gallery/', include('gallery.urls')),`` to your ``urls.py``

In your ``application/models.py`` create the content type::

    from gallery.models import GalleryContent

    Page.create_content_type(GalleryContent)


* run ``python manage.py syncdb``

* add ``{{ feincms_page.content.media }}`` (or media.js and media.css) to the ``<head>`` of your template.


Usage
-----

For each type, there is a gallery template, a JavaScript and CSS. They are in the folder templates/content/gallery, or static/content/gallery.
For the types carousel, panel and product there is a link to the document page as a comment in the JS file.

To customize the gallery to your site, it's best to copy the CSS and JS in your own media folder and edit it there. The configurations are stored in separate files.

To be able to adjust fancybox.init(), the gallery.js file from the gallery/media folder must be copied to the project media folder.

It is possible to define a template fallback, if a gallery contains only one image. E.g. product.html has the fallback template image_product.html.
