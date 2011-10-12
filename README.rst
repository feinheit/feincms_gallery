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

In your ``application/models.py`` create the content type::

    from gallery.models import GalleryContent

    Page.create_content_type(GalleryContent)


* run ``python manage.py syncdb``


Usage
-----

Für jeden Galerie-Typ gibt es ein Template, ein JavaScript und ein CSS. Diese sind im Order Templates/content/gallery, bzw. Static/content/gallery.
Für die Typen Carousel, Panel und Product gibt es einen Link zur Doku-Seite als Kommentar im JS File.

Um die Galerie an die Seite anzupassen, am besten das CSS und JS in den eigenen Media-Ordner kopieren und dort bearbeiten. Die Konfigurationen sind in separaten Dateien.

Damit man Fancybox init anpassen kann, muss die Datei gallery.js aus dem gallery/media Ordner in den Projekt-Medien-Ordner kopiert werden.

Es gibt die Möglichkeit, ein Fallback Template zu definieren, falls die Galerie nur ein Bild enthält. Z.B. für product.html wäre das Fallback-Template image_product.html. 
