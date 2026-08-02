from django.db.models import Count, Prefetch, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .filters import ApplicationFilter, OpportunityFilter
from .models import Application, Opportunity
from .serializers import ApplicationSerializer, OpportunitySerializer, mark_application_applied


class OpportunityViewSet(viewsets.ModelViewSet):
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OpportunityFilter
    search_fields = ["title", "organization", "summary", "location", "eligibility", "requirements"]
    ordering_fields = ["deadline", "created_at", "updated_at", "extraction_confidence"]

    def get_queryset(self):
        return Opportunity.objects.filter(owner=self.request.user).annotate(
            user_application_count=Count("applications", filter=Q(applications__owner=self.request.user))
        ).prefetch_related(
            Prefetch("applications", queryset=Application.objects.filter(owner=self.request.user).only("id", "opportunity_id"), to_attr="current_user_applications")
        ).order_by("deadline", "-created_at")

    def perform_create(self, serializer): serializer.save(owner=self.request.user)

    def period_response(self, queryset):
        page = self.paginate_queryset(queryset)
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    @action(detail=False)
    def upcoming(self, request):
        return self.period_response(self.filter_queryset(self.get_queryset().filter(deadline__gte=timezone.now())))

    @action(detail=False)
    def expired(self, request):
        return self.period_response(self.filter_queryset(self.get_queryset().filter(deadline__lt=timezone.now())))

    @action(detail=True, methods=["post"], url_path="mark-applied")
    def mark_applied(self, request, pk=None):
        opportunity = self.get_object()
        application, _ = Application.objects.get_or_create(
            owner=request.user, opportunity=opportunity, defaults={"stage": "saved"}
        )
        return Response(ApplicationSerializer(mark_application_applied(application)).data)


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ApplicationFilter
    search_fields = ["opportunity__title", "opportunity__organization", "application_id", "next_action", "notes"]
    ordering_fields = ["applied_at", "next_action_at", "follow_up_at", "expected_result_at", "created_at"]

    def get_queryset(self):
        return Application.objects.filter(owner=self.request.user).select_related("opportunity", "submission_activity")

    def perform_create(self, serializer): serializer.save(owner=self.request.user)
