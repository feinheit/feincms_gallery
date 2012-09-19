#coding=utf-8
import json

from django import forms
from django.contrib import admin
from django.core.exceptions import FieldError, ObjectDoesNotExist
from django.http import (HttpResponse, HttpResponseRedirect,
    HttpResponseBadRequest, HttpResponseForbidden)
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from django.utils.html import escapejs
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _, ungettext
from django.views.decorators.csrf import csrf_exempt

from feincms.module.medialibrary.models import Category, MediaFile
from feincms.templatetags import feincms_thumbnail

from models import Gallery, GalleryMediaFile


class MediaFileWidget(forms.TextInput):
    """
    TextInput widget, shows a link to the current value if there is one.
    """

    def render(self, name, value, attrs=None):
        inputfield = super(MediaFileWidget, self).render(name, value, attrs)
        if value:
            try:
                mf = MediaFile.objects.get(pk=value)
            except MediaFile.DoesNotExist:
                return inputfield

            try:
                caption = mf.translation.caption
            except (ObjectDoesNotExist, AttributeError):
                caption = _('(no caption)')

            if mf.type == 'image':
                image = feincms_thumbnail.thumbnail(mf.file.name, '188x142')
                image = u'background: url(%(url)s) center center no-repeat;' % {'url': image}
            else:
                image = u''

            return mark_safe(u"""
                <div style="%(image)s" class="admin-gallery-image-bg absolute">
                <p class="admin-gallery-image-caption absolute">%(caption)s</p>
                %(inputfield)s</div>""" % {
                    'image': image,
                    'caption': caption,
                    'inputfield': inputfield})

        return inputfield


class ThumbnailForm(forms.Form):
    id = forms.ModelChoiceField(
        queryset=MediaFile.objects.filter(type='image')
    )
    width = forms.IntegerField(min_value=0)
    height = forms.IntegerField(min_value=0)


@csrf_exempt
def admin_thumbnail(request):
    content = u''
    if request.method == 'POST' and request.is_ajax():
        form = ThumbnailForm(request.POST)
        if not form.is_valid():
            return HttpResponseBadRequest(form.errors)
        data = form.cleaned_data

        obj = data['id']
        dimensions = '%sx%s' % (data['width'], data['height'])

        if obj.type == 'image':
            image = None
            try:
                image = feincms_thumbnail.thumbnail(obj.file.name, dimensions)
            except:
                pass

            if image:
                content = json.dumps({
                    'url': image.url,
                    'name': escapejs(obj.translation.caption)
                    })
        return HttpResponse(content, mimetype='application/json')
    else:
        return HttpResponseForbidden()
admin_thumbnail.short_description = _('Image')
admin_thumbnail.allow_tags = True


class MediaFileAdminForm(forms.ModelForm):
    mediafile = forms.ModelChoiceField(queryset=MediaFile.objects.filter(type='image'),
                                widget=MediaFileWidget(attrs={'class': 'image-fk'}), label=_('media file'))
    class Meta:
        model = GalleryMediaFile


class GalleryMediaFileAdmin(admin.ModelAdmin):
    form = MediaFileAdminForm
    model = GalleryMediaFile
    list_display = ['__unicode__', admin_thumbnail]
    classes = ['sortable']


class GalleryMediaFileInline(admin.StackedInline):
    model = GalleryMediaFile
    raw_id_fields = ('mediafile',)
    extra = 0
    form = MediaFileAdminForm
    classes = ['sortable']
    ordering = ['ordering']
    template = 'admin/gallery/gallery/stacked.html'


class GalleryAdmin(admin.ModelAdmin):
    inlines = (GalleryMediaFileInline,)
    list_display = ['title', 'verbose_images']

    class AddCategoryForm(forms.Form):
        _selected_action = forms.CharField(widget=forms.MultipleHiddenInput)
        category = forms.ModelChoiceField(Category.objects)

    def assign_category(self, request, queryset):
        form = None
        if 'apply' in request.POST:
            form = self.AddCategoryForm(request.POST)
            if form.is_valid():
                category = form.cleaned_data['category']
                count = 0
                mediafiles = MediaFile.objects.filter(categories=category)
                for gallery in queryset:
                    for mediafile in mediafiles:
                        try:
                            GalleryMediaFile.objects.create(gallery = gallery, mediafile=mediafile)
                        except FieldError:
                            pass
                        count += 1
                message = ungettext('Successfully added %(count)d mediafiles in %(category)s Category.',
                                    'Successfully added %(count)d mediafiles in %(category)s Categories.', count) % {
                                    'count':count, 'category':category }
                self.message_user(request, message)
                return HttpResponseRedirect(request.get_full_path())

        if not form:
            form = self.AddCategoryForm(initial={'_selected_action': request.POST.getlist(admin.ACTION_CHECKBOX_NAME)})
        return render_to_response('admin/gallery/add_category.html', {'mediafiles': queryset,
                                                         'category_form': form,
                                                        }, context_instance=RequestContext(request))
    assign_category.short_description = _('Assign Images from a Category to this Gallery')
    actions = [assign_category]


admin.site.register(Gallery, GalleryAdmin)
