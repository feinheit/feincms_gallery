from django.urls import path

from gallery.admin import admin_thumbnail


urlpatterns = [
    path("thumbnail/", admin_thumbnail, name="gallery_admin_thumbnail"),
]
