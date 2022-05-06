import json

from admin_ordering.admin import OrderableAdmin
from django import forms
from django.contrib import admin
from django.contrib.admin import helpers
from django.core.exceptions import FieldError, ObjectDoesNotExist
from django.http import (
    HttpResponse,
    HttpResponseBadRequest,
    HttpResponseForbidden,
    HttpResponseRedirect,
)
from django.shortcuts import render
from django.utils.html import escapejs
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _, ngettext
from django.views.decorators.csrf import csrf_exempt
from feincms.module.medialibrary.models import Category, MediaFile
from feincms.templatetags import feincms_thumbnail

from .models import Gallery, GalleryMediaFile


class MediaFileWidget(forms.TextInput):
    """
    TextInput widget, shows a link to the current value if there is one.
    """

    def render(self, name, value, attrs=None, renderer=None):
        inputfield = super().render(name, value, attrs, renderer)
        if value:
            try:
                mf = MediaFile.objects.get(pk=value)
            except MediaFile.DoesNotExist:
                return inputfield

            try:
                caption = mf.translation.caption
            except (ObjectDoesNotExist, AttributeError):
                caption = _("(no caption)")

            if mf.type == "image":
                image = feincms_thumbnail.thumbnail(mf.file.name, "188x142")
                image = f"background: url({image}) center center no-repeat;"
            else:
                image = ""

            return mark_safe(
                """
                <div style="{image}" class="admin-gallery-image-bg absolute">
                <p class="admin-gallery-image-caption absolute">{caption}</p>
                {inputfield}</div>""".format(
                    image=image, caption=caption, inputfield=inputfield
                )
            )

        return inputfield


class ThumbnailForm(forms.Form):
    id = forms.ModelChoiceField(queryset=MediaFile.objects.filter(type="image"))
    width = forms.IntegerField(min_value=0)
    height = forms.IntegerField(min_value=0)


@csrf_exempt
def admin_thumbnail(request):
    content = ""
    if request.method == "POST" and request.is_ajax():
        form = ThumbnailForm(request.POST)
        if not form.is_valid():
            return HttpResponseBadRequest(form.errors)
        data = form.cleaned_data

        obj = data["id"]
        dimensions = "{}x{}".format(data["width"], data["height"])

        if obj.type == "image":
            image = None
            try:
                image = feincms_thumbnail.thumbnail(obj.file.name, dimensions)
            except Exception:
                pass

            if image:
                try:
                    caption = obj.translation.caption
                except AttributeError:
                    caption = _("untitled")
                content = json.dumps({"url": image.url, "name": escapejs(caption)})
        return HttpResponse(content, content_type="application/json")
    else:
        return HttpResponseForbidden()


admin_thumbnail.short_description = _("Image")
admin_thumbnail.allow_tags = True


class MediaFileAdminForm(forms.ModelForm):
    mediafile = forms.ModelChoiceField(
        queryset=MediaFile.objects.filter(type="image"),
        widget=MediaFileWidget(attrs={"class": "image-fk"}),
        label=_("media file"),
    )

    class Meta:
        model = GalleryMediaFile
        fields = ("gallery", "mediafile", "ordering")


class GalleryMediaFileAdmin(admin.ModelAdmin):
    form = MediaFileAdminForm
    model = GalleryMediaFile
    list_display = ["__str__", admin_thumbnail]
    classes = ["sortable"]


class GalleryMediaFileInline(OrderableAdmin, admin.TabularInline):
    model = GalleryMediaFile
    raw_id_fields = ["mediafile"]
    extra = 0
    # form = MediaFileAdminForm
    # template = "admin/gallery/gallery/stacked.html"
    ordering = ["ordering"]


class GalleryAdmin(admin.ModelAdmin):
    inlines = (GalleryMediaFileInline,)
    list_display = ["title", "verbose_images"]

    class AddCategoryForm(forms.Form):
        _selected_action = forms.CharField(widget=forms.MultipleHiddenInput)
        category = forms.ModelChoiceField(Category.objects)

    def assign_category(self, request, queryset):
        form = None
        if "apply" in request.POST:
            form = self.AddCategoryForm(request.POST)
            if form.is_valid():
                category = form.cleaned_data["category"]
                count = 0
                mediafiles = MediaFile.objects.filter(categories=category)
                for gallery in queryset:
                    for mediafile in mediafiles:
                        try:
                            GalleryMediaFile.objects.create(
                                gallery=gallery, mediafile=mediafile
                            )
                        except FieldError:
                            pass
                        count += 1
                message = ngettext(
                    "Successfully added %(count)d mediafiles in %(category)s Category.",
                    "Successfully added %(count)d mediafiles in %(category)s Categories.",
                    count,
                ) % {"count": count, "category": category}
                self.message_user(request, message)
                return HttpResponseRedirect(request.get_full_path())

        if not form:
            form = self.AddCategoryForm(
                initial={
                    "_selected_action": request.POST.getlist(
                        helpers.ACTION_CHECKBOX_NAME
                    )
                }
            )
        return render(
            request,
            "admin/gallery/add_category.html",
            {
                "mediafiles": queryset,
                "category_form": form,
            },
        )

    assign_category.short_description = _(
        "Assign Images from a Category to this Gallery"
    )
    actions = [assign_category]


admin.site.register(Gallery, GalleryAdmin)
