from admin_ordering.admin import OrderableAdmin
from django import forms
from django.contrib import admin
from django.contrib.admin import helpers
from django.core.exceptions import FieldError
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.translation import gettext_lazy as _, ngettext
from feincms.module.medialibrary.models import Category, MediaFile

from .models import Gallery, GalleryMediaFile


class GalleryMediaFileInline(OrderableAdmin, admin.TabularInline):
    model = GalleryMediaFile
    raw_id_fields = ["mediafile"]
    extra = 0
    # form = MediaFileAdminForm
    # template = "admin/gallery/gallery/stacked.html"
    ordering = ["ordering"]


@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    inlines = [GalleryMediaFileInline]
    list_display = ["title", "verbose_images"]

    class AddCategoryForm(forms.Form):
        _selected_action = forms.CharField(widget=forms.MultipleHiddenInput)
        category = forms.ModelChoiceField(Category.objects)

    @admin.action(description=_("Assign Images from a Category to this Gallery"))
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

    actions = [assign_category]
