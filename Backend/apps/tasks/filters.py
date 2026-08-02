from datetime import datetime, time

import django_filters
from django.utils import timezone

from .models import Task


class TaskFilter(django_filters.FilterSet):
    due_date = django_filters.DateFilter(method="filter_due_date")
    completed = django_filters.BooleanFilter(method="filter_completed")

    class Meta:
        model = Task
        fields = ("status", "priority", "area", "due_date", "completed")

    def filter_due_date(self, queryset, name, value):
        current_tz = timezone.get_current_timezone()
        start = timezone.make_aware(datetime.combine(value, time.min), current_tz)
        end = timezone.make_aware(datetime.combine(value, time.max), current_tz)
        return queryset.filter(due_at__range=(start, end))

    def filter_completed(self, queryset, name, value):
        lookup = {"status": Task.Status.COMPLETED}
        return queryset.filter(**lookup) if value else queryset.exclude(**lookup)
