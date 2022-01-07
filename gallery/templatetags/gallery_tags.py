import random

from django import template
from django.db.models.query import QuerySet


register = template.Library()


@register.filter
def randomize(values):
    if isinstance(values, QuerySet):
        return values.order_by("?")
    if isinstance(values, list):
        return random.shuffle(values)
    return values
