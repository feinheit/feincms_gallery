#coding=utf-8
from django import template
import random
register = template.Library()
from django.db.models.query import QuerySet


@register.filter
def randomize(values):
    if not isinstance(values, QuerySet):
        if isinstance(values, list):
            return random.shuffle(values)
        return values
    return values.order_by('?')
