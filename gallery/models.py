#coding=utf-8
from django import forms
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.paginator import Paginator, InvalidPage, EmptyPage
from django.db import models
from django.template import TemplateDoesNotExist
from django.template.context import RequestContext
from django.template.loader import render_to_string
from django.utils.translation import ungettext_lazy, ugettext_lazy as _

from feincms.module.medialibrary.models import MediaFile


class Gallery(models.Model):
    title = models.CharField(max_length=30)
    images = models.ManyToManyField(MediaFile, through='GalleryMediaFile')
    
    def ordered_images(self):
        return self.images.select_related().all().order_by('gallerymediafile__ordering')
    
    def count_images(self):
        return self.images.all().count()
    
    def verbose_images(self):
        count = self.count_images()
        return ungettext_lazy('%(count)d Image', '%(count)d Images', count) % {
                                                'count': count,}
    verbose_images.short_description = _('Image Count')
    
    class Meta:
        verbose_name = _('Gallery')
        verbose_name_plural = _('Galleries')
    
    def __unicode__(self):
        return self.title
    

class GalleryMediaFile(models.Model):
    gallery = models.ForeignKey(Gallery)
    mediafile = models.ForeignKey(MediaFile)
    ordering = models.IntegerField(default=9999)
    
    class Meta:
        verbose_name = 'Image for Gallery'
        verbose_name_plural = 'Images for Gallery'
        ordering = ['ordering']
        
    def __unicode__(self):
        return u'%s' %self.mediafile


""" p. stands for paginated. Those types have pagination enabled. And that's how you enable it. 
    Read about media property here: http://docs.djangoproject.com/en/dev/topics/forms/media/
    If you need different JS libraries for your gallery, create your own GALLERY_TYPE_COICES array
    and define it as attribute when initializing the content type.
    Make sure your base template has {{ feincms_page.content.media.js }} in the header and
    {{ feincms_page.content.media.js }} at the end.
"""

GALLERY_TYPE_CHOICES = (
    #('p.classic' , _('Classic Gallery with full size lightbox.')),
    #('p.clasiccaption' , _('Classic Gallery with caption and full size lightbox.')),
    ('p.classiclm', _('Classic Gallery with Lightbox.')),
    ('p.classiclmcaption', _('Classic Gallery with caption and Lightbox.')),
    ('carousel', _('Single line Strip Board')),
    ('panel', _('Fancy Panel')),
    ('slideshow', _('Simple Slideshow')),
    ('product', _('Product Gallery')),
    )

standard_gallery_media = {'css':{'all':('content/gallery/classic.css',)}}

DEFAULT_FORM_MEDIA_DICT = {'gallery': {'css': {'all': ('lib/fancybox/jquery.fancybox-1.3.1.css', )},
                                       'js': ('lib/fancybox/jquery.fancybox-1.3.1.pack.js',
                                              'content/gallery/gallery.js')},
                           'gallery_p.classic': standard_gallery_media,
                           'gallery_p.clasiccaption': standard_gallery_media,
                           'gallery_p.classiclm': standard_gallery_media,
                           'gallery_p.classiclmcaption': standard_gallery_media,
                           'gallery_slideshow': {'css': {'all': ('content/gallery/slideshow.css',)},
                                                 'js': ('content/gallery/slideshow.js',)},
                           'gallery_carousel': {'css': {'all': ('content/gallery/carousel.css',)},
                                                'js': ('content/gallery/jquery.infinitecarousel2.min.js',
                                                       'content/gallery/carousel.js',)},
                           'gallery_panel': {'js': (
                           'content/gallery/jquery.panelgallery-2.0.0.min.js', 'content/gallery/panelgallery.js')},
                           'gallery_product': {'css': {'all': ('content/gallery/product.css',)},
                                               'js': ('content/gallery/jquery.infinitecarousel2.min.js',
                                                      'content/gallery/product.js',)},

                           }

class GalleryContent(models.Model):
    @classmethod
    def initialize_type(cls, TYPE_CHOICES=GALLERY_TYPE_CHOICES, FORM_MEDIA_DICT=DEFAULT_FORM_MEDIA_DICT, 
                        columns=3, orphans=3, paginate_by=12, **kwargs):
        if 'feincms.module.medialibrary' not in settings.INSTALLED_APPS:
            raise ImproperlyConfigured, 'You have to add \'feincms.module.medialibrary\' to your INSTALLED_APPS before creating a %s' % cls.__name__
        cls.FORM_MEDIA_DICT = FORM_MEDIA_DICT
        cls.paginate_by, cls.orphans, cls.columns = paginate_by, orphans, columns
        cls.TYPE_CHOICES = TYPE_CHOICES
        
        cls.add_to_class('type', models.CharField(max_length=20, choices=TYPE_CHOICES, default='p.div'))
        
    gallery = models.ForeignKey(Gallery, \
        help_text=_('Choose a gallery to render here'),
        related_name='%(app_label)s_%(class)s_gallery')


    @property
    def media(self):
        media = forms.Media()
        media.add_css(self.FORM_MEDIA_DICT['gallery'].get('css'))
        media.add_js(self.FORM_MEDIA_DICT['gallery'].get('js'))
        if self.FORM_MEDIA_DICT.get('gallery_%s' %self.type, None):
            media.add_css(self.FORM_MEDIA_DICT['gallery_%s'%self.type].get('css', {}))
            media.add_js(self.FORM_MEDIA_DICT['gallery_%s'%self.type].get('js', ''))
        
        return media
      
    def has_pagination(self):
        return self.type[:2] == 'p.'    
        
    class Meta:
        abstract = True
        verbose_name = _('Image Gallery')
        verbose_name_plural = _('Image Galleries')


    def render(self, request, **kwargs):
        objects = self.gallery.ordered_images()
        remaining = []
        if len(objects) == 1:
            try:
                return render_to_string('content/gallery/image_%s.html' %self.type, 
                        {'image': objects[0], 'content': self}, context_instance=RequestContext(request))
            except TemplateDoesNotExist:
                pass
        # check if the type is paginated
        if self.has_pagination():
            paginator = Paginator(objects, self.paginate_by, orphans=self.orphans)
            try:
                page = int(request.GET.get('page', 1))
            except ValueError:
                page = 1
            try:
                current_page = paginator.page(page)
            except (EmptyPage, InvalidPage):
                current_page = paginator.page(paginator.num_pages)

            images = current_page.object_list

            for object in objects:
                if object not in images:
                    remaining.append(object)
        else:
            current_page, paginator = None, None
            images = objects            
                    
        return render_to_string([
            'content/gallery/%s.html' % self.type,
            'content/gallery/classiclm.html',
            ], {'content': self, 'block':current_page,
                'images': images, 'paginator': paginator,
                'remaining': remaining },
            context_instance = RequestContext(request))

    def __unicode__(self):
        return unicode(self.gallery)
