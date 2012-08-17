from django.conf.urls.defaults import patterns, url
from gallery.admin import admin_thumbnail

urlpatterns = patterns('',
    url(r'^thumbnail/$', admin_thumbnail, name='gallery_admin_thumbnail'),
)
