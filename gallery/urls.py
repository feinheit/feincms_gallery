try:
    from django.conf.urls import url
except ImportError:  # Older Django versions
    from django.conf.urls.defaults import url

from gallery.admin import admin_thumbnail


urlpatterns = [
    url(r'^thumbnail/$', admin_thumbnail, name='gallery_admin_thumbnail'),
]
