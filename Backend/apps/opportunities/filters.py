import django_filters
from django.utils import timezone

from .models import Application, Opportunity


class OpportunityFilter(django_filters.FilterSet):
    deadline_after = django_filters.IsoDateTimeFilter(field_name="deadline", lookup_expr="gte")
    deadline_before = django_filters.IsoDateTimeFilter(field_name="deadline", lookup_expr="lte")
    applied = django_filters.BooleanFilter(method="filter_applied")
    organization = django_filters.CharFilter(field_name="organization", lookup_expr="icontains")

    class Meta:
        model = Opportunity
        fields = ("opportunity_type", "source_platform", "organization", "status", "applied")

    def filter_applied(self, queryset, name, value):
        return queryset.filter(applications__owner=self.request.user).distinct() if value else queryset.exclude(applications__owner=self.request.user)


class ApplicationFilter(django_filters.FilterSet):
    upcoming_follow_up = django_filters.BooleanFilter(method="upcoming_follow_up_filter")
    overdue_follow_up = django_filters.BooleanFilter(method="overdue_follow_up_filter")
    upcoming_next_action = django_filters.BooleanFilter(method="upcoming_next_action_filter")
    overdue_next_action = django_filters.BooleanFilter(method="overdue_next_action_filter")

    class Meta:
        model = Application
        fields = ("stage",)

    def upcoming_follow_up_filter(self, queryset, name, value):
        return queryset.filter(follow_up_at__gte=timezone.now()) if value else queryset

    def overdue_follow_up_filter(self, queryset, name, value):
        return queryset.filter(follow_up_at__lt=timezone.now()).exclude(stage__in=["selected", "rejected", "withdrawn", "expired"]) if value else queryset

    def upcoming_next_action_filter(self, queryset, name, value):
        return queryset.filter(next_action_at__gte=timezone.now()) if value else queryset

    def overdue_next_action_filter(self, queryset, name, value):
        return queryset.filter(next_action_at__lt=timezone.now()).exclude(stage__in=["selected", "rejected", "withdrawn", "expired"]) if value else queryset
