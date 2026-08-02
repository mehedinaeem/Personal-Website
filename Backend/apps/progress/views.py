from calendar import monthrange
from datetime import date, datetime, time, timedelta

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.learning.models import LearningSession
from apps.tasks.models import Task, TaskProgressLog
from apps.travel.models import TravelPlan
from .models import ActivityLog, Goal, ProgressReview
from .serializers import ActivityLogSerializer, GoalSerializer, ProgressReviewSerializer


class OwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GoalViewSet(OwnedViewSet):
    serializer_class = GoalSerializer
    search_fields = ["title", "description", "category", "unit"]
    ordering_fields = ["start_date", "end_date", "priority", "current_value", "target_value"]
    ordering = ["end_date"]

    def get_queryset(self):
        queryset = Goal.objects.filter(owner=self.request.user).prefetch_related("related_tasks")
        for key in ("period_type", "category", "status"):
            if self.request.query_params.get(key):
                queryset = queryset.filter(**{key: self.request.query_params[key]})
        if self.request.query_params.get("start_date"): queryset = queryset.filter(end_date__gte=self.request.query_params["start_date"])
        if self.request.query_params.get("end_date"): queryset = queryset.filter(start_date__lte=self.request.query_params["end_date"])
        return queryset

    def _period(self, period):
        page = self.paginate_queryset(self.get_queryset().filter(period_type=period))
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    @action(detail=False) 
    def daily(self, request): return self._period("daily")
    @action(detail=False)
    def monthly(self, request): return self._period("monthly")
    @action(detail=False)
    def yearly(self, request): return self._period("yearly")

    @action(detail=True, methods=["post"], url_path="update-progress")
    def update_progress(self, request, pk=None):
        goal = self.get_object()
        serializer = self.get_serializer(goal, data={"current_value": request.data.get("current_value")}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        goal = self.get_object()
        goal.status = "completed"
        goal.save()
        return Response(self.get_serializer(goal).data)


class ReviewViewSet(OwnedViewSet):
    serializer_class = ProgressReviewSerializer
    search_fields = ["summary", "completed_work", "important_achievements", "lessons_learned"]
    ordering_fields = ["period_start", "period_end", "productivity_rating"]

    def get_queryset(self):
        queryset = ProgressReview.objects.filter(owner=self.request.user)
        if self.request.query_params.get("period_type"):
            queryset = queryset.filter(period_type=self.request.query_params["period_type"])
        if self.request.query_params.get("start_date"): queryset = queryset.filter(period_end__gte=self.request.query_params["start_date"])
        if self.request.query_params.get("end_date"): queryset = queryset.filter(period_start__lte=self.request.query_params["end_date"])
        return queryset

    def current(self, period):
        start, end = period_range(period)
        review = self.get_queryset().filter(period_type=period, period_start=start, period_end=end).first()
        return Response(self.get_serializer(review).data if review else None)

    @action(detail=False, url_path="current-day")
    def current_day(self, request): return self.current("daily")
    @action(detail=False, url_path="current-month")
    def current_month(self, request): return self.current("monthly")
    @action(detail=False, url_path="current-year")
    def current_year(self, request): return self.current("yearly")


class ActivityViewSet(OwnedViewSet):
    serializer_class = ActivityLogSerializer
    search_fields = ["title", "description", "result", "lesson_learned"]
    ordering_fields = ["activity_date", "minutes_spent", "progress_value", "created_at"]

    def get_queryset(self):
        queryset = ActivityLog.objects.filter(owner=self.request.user).select_related("related_task", "related_goal")
        for key in ("category", "activity_type"):
            if self.request.query_params.get(key): queryset = queryset.filter(**{key: self.request.query_params[key]})
        if self.request.query_params.get("start_date"): queryset = queryset.filter(activity_date__gte=self.request.query_params["start_date"])
        if self.request.query_params.get("end_date"): queryset = queryset.filter(activity_date__lte=self.request.query_params["end_date"])
        return queryset


def period_range(period, start=None, end=None):
    today = timezone.localdate()
    if start and end: return date.fromisoformat(start), date.fromisoformat(end)
    if period == "daily": return today, today
    if period == "weekly": return today - timedelta(days=today.weekday()), today - timedelta(days=today.weekday()) + timedelta(days=6)
    if period == "yearly": return date(today.year, 1, 1), date(today.year, 12, 31)
    return date(today.year, today.month, 1), date(today.year, today.month, monthrange(today.year, today.month)[1])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def progress_summary(request):
    period = request.query_params.get("period", "monthly")
    if period not in {"daily", "weekly", "monthly", "yearly"}:
        return Response({"detail": "Invalid period."}, status=status.HTTP_400_BAD_REQUEST)
    try: start, end = period_range(period, request.query_params.get("start_date"), request.query_params.get("end_date"))
    except ValueError: return Response({"detail": "Dates must use YYYY-MM-DD."}, status=400)
    if end < start: return Response({"detail": "end_date cannot precede start_date."}, status=400)
    user, category = request.user, request.query_params.get("category")
    tz = timezone.get_current_timezone()
    start_at = timezone.make_aware(datetime.combine(start, time.min), tz)
    end_at = timezone.make_aware(datetime.combine(end + timedelta(days=1), time.min), tz)
    tasks = Task.objects.filter(owner=user, created_at__gte=start_at, created_at__lt=end_at)
    task_logs = TaskProgressLog.objects.filter(owner=user, log_date__range=(start, end))
    activities = ActivityLog.objects.filter(owner=user, activity_date__range=(start, end))
    goals = Goal.objects.filter(owner=user, start_date__lte=end, end_date__gte=start)
    learning = LearningSession.objects.filter(owner=user, session_date__range=(start, end))
    if category:
        tasks, task_logs, activities, goals = tasks.filter(area=category), task_logs.filter(task__area=category), activities.filter(category=category), goals.filter(category=category)
    completed_tasks = tasks.filter(status="completed").count()
    task_minutes = task_logs.aggregate(total=Sum("minutes_spent"))["total"] or 0
    unlinked_activity_minutes = activities.filter(related_task__isnull=True).aggregate(total=Sum("minutes_spent"))["total"] or 0
    learning_minutes = learning.aggregate(total=Sum("minutes_spent"))["total"] or 0
    completed_by_day = {row["day"]: row["count"] for row in tasks.filter(completed_at__isnull=False).annotate(day=TruncDate("completed_at", tzinfo=tz)).values("day").annotate(count=Count("id"))}
    work_by_day = {row["log_date"]: row["total"] for row in task_logs.values("log_date").annotate(total=Sum("minutes_spent"))}
    for row in activities.filter(related_task__isnull=True).values("activity_date").annotate(total=Sum("minutes_spent")):
        work_by_day[row["activity_date"]] = work_by_day.get(row["activity_date"], 0) + row["total"]
    learning_by_day = {row["session_date"]: row["total"] for row in learning.values("session_date").annotate(total=Sum("minutes_spent"))}
    activities_by_day = {row["activity_date"]: row["count"] for row in activities.values("activity_date").annotate(count=Count("id"))}
    series, cursor = [], start
    while cursor <= end:
        completed, work, learned, activity_count = completed_by_day.get(cursor, 0), work_by_day.get(cursor, 0), learning_by_day.get(cursor, 0), activities_by_day.get(cursor, 0)
        series.append({"date": cursor.isoformat(), "completed_tasks": completed, "work_minutes": work, "learning_minutes": learned, "activities": activity_count, "activity_score": min(100, completed * 20 + activity_count * 10 + min(work + learned, 480) / 6)})
        cursor += timedelta(days=1)
    planned = tasks.count()
    return Response({
        "period": period, "start_date": start, "end_date": end,
        "summary": {"tasks_planned": planned, "tasks_completed": completed_tasks, "completion_percentage": round(completed_tasks / planned * 100, 2) if planned else 0, "total_work_minutes": task_minutes + unlinked_activity_minutes, "learning_minutes": learning_minutes, "active_days": sum(1 for row in series if row["work_minutes"] or row["learning_minutes"] or row["completed_tasks"] or row["activities"]), "goals_completed": goals.filter(status="completed").count()},
        "daily_series": series,
        "category_breakdown": list(tasks.values("area").annotate(count=Count("id"), completed=Count("id", filter=Q(status="completed"))).order_by("area")),
        "goal_progress": [{"id": goal.id, "label": goal.title, "current_value": float(goal.current_value), "target_value": float(goal.target_value), "percentage": goal.completion_percentage} for goal in goals],
        "learning_breakdown": list(learning.values("learning_item__skill").annotate(minutes=Sum("minutes_spent")).order_by("learning_item__skill")),
        "travel_summary": {"plans": TravelPlan.objects.filter(owner=user, start_date__lte=end, end_date__gte=start).count()},
    })
