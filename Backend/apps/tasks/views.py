from datetime import datetime, time, timedelta

from django.db.models import Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .filters import TaskFilter
from .models import DailyReview, Task
from .serializers import DailyReviewSerializer, TaskProgressLogSerializer, TaskSerializer


def local_day_bounds(day=None):
    day = day or timezone.localdate()
    tz = timezone.get_current_timezone()
    start = timezone.make_aware(datetime.combine(day, time.min), tz)
    return start, start + timedelta(days=1)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TaskFilter
    search_fields = ["title", "description", "next_action"]
    ordering_fields = [
        "created_at", "updated_at", "start_at", "due_at", "priority",
        "progress_percentage", "estimated_minutes", "actual_minutes",
    ]
    ordering = ["due_at", "-priority"]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"])
    def today(self, request):
        start, end = local_day_bounds()
        queryset = self.filter_queryset(
            self.get_queryset().filter(
                Q(due_at__gte=start, due_at__lt=end) | Q(start_at__gte=start, start_at__lt=end)
            )
        )
        page = self.paginate_queryset(queryset)
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        _, tomorrow = local_day_bounds()
        queryset = self.filter_queryset(
            self.get_queryset()
            .filter(due_at__gte=tomorrow)
            .exclude(status__in=[Task.Status.COMPLETED, Task.Status.CANCELLED])
        )
        page = self.paginate_queryset(queryset)
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    @action(detail=False, methods=["get"])
    def overdue(self, request):
        queryset = self.filter_queryset(
            self.get_queryset()
            .filter(due_at__lt=timezone.now())
            .exclude(status__in=[Task.Status.COMPLETED, Task.Status.CANCELLED])
        )
        page = self.paginate_queryset(queryset)
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = Task.Status.COMPLETED
        task.save(update_fields=["status", "progress_percentage", "completed_at", "updated_at"])
        return Response(self.get_serializer(task).data)

    @action(detail=True, methods=["get", "post"])
    def logs(self, request, pk=None):
        task = self.get_object()
        if request.method == "GET":
            queryset = task.progress_logs.filter(owner=request.user)
            page = self.paginate_queryset(queryset)
            serializer = TaskProgressLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TaskProgressLogSerializer(
            data=request.data, context={"request": request, "task": task}
        )
        serializer.is_valid(raise_exception=True)
        log = serializer.save()
        return Response(TaskProgressLogSerializer(log).data, status=status.HTTP_201_CREATED)


class DailyReviewViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = DailyReviewSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "review_date"
    lookup_value_regex = r"\d{4}-\d{2}-\d{2}"

    def get_queryset(self):
        return DailyReview.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
