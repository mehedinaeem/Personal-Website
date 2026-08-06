from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum

from apps.capture.models import CapturedLink
from apps.learning.models import LearningSession
from apps.notifications.models import Reminder
from apps.opportunities.models import Application, Opportunity
from apps.progress.models import ActivityLog, Goal
from apps.tasks.models import Task, TaskProgressLog
from apps.travel.models import TravelPlan


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "service": "portfolio-backend"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summary(request):
    user, now, today = request.user, timezone.now(), timezone.localdate()
    week_start = today - timedelta(days=today.weekday()); month_start = today.replace(day=1); year_start = today.replace(month=1, day=1)
    incomplete = Task.objects.filter(owner=user).exclude(status__in=["completed", "cancelled"])
    tasks_week = Task.objects.filter(owner=user, created_at__date__gte=week_start, created_at__date__lte=today)
    completed_week = Task.objects.filter(owner=user, completed_at__date__gte=week_start, completed_at__date__lte=today).count()
    applications = Application.objects.filter(owner=user).select_related("opportunity")
    def minutes(start, learning=False):
        if learning: return LearningSession.objects.filter(owner=user, session_date__range=(start, today)).aggregate(v=Sum("minutes_spent"))["v"] or 0
        logs = TaskProgressLog.objects.filter(owner=user, log_date__range=(start, today)).aggregate(v=Sum("minutes_spent"))["v"] or 0
        extra = ActivityLog.objects.filter(owner=user, activity_date__range=(start, today), related_task__isnull=True).aggregate(v=Sum("minutes_spent"))["v"] or 0
        return logs + extra
    return Response({
        "today_tasks": list(incomplete.filter(due_at__date=today).values("id", "title", "priority", "status", "due_at", "progress_percentage", "next_action")[:10]),
        "overdue_tasks": list(incomplete.filter(due_at__lt=now).values("id", "title", "due_at", "priority")[:10]),
        "daily_goals": list(Goal.objects.filter(owner=user, period_type="daily", status="active", start_date__lte=today, end_date__gte=today).values("id", "title", "current_value", "target_value")[:10]),
        "monthly_goals": list(Goal.objects.filter(owner=user, period_type="monthly", status="active").values("id", "title", "current_value", "target_value", "end_date")[:10]),
        "yearly_goals": list(Goal.objects.filter(owner=user, period_type="yearly").values("id", "title", "current_value", "target_value", "status", "end_date")[:20]),
        "upcoming_task_deadlines": list(incomplete.filter(due_at__gte=now, due_at__lte=now + timedelta(days=7)).values("id", "title", "due_at")[:10]),
        "upcoming_opportunity_deadlines": list(Opportunity.objects.filter(owner=user, deadline__gte=now, deadline__lte=now + timedelta(days=7)).values("id", "title", "organization", "deadline")[:10]),
        "applications_needing_follow_up": list(applications.filter(follow_up_at__lte=now).exclude(stage__in=["selected", "rejected", "withdrawn", "expired"]).values("id", "opportunity__title", "stage", "follow_up_at", "next_action")[:10]),
        "applications_by_stage": list(applications.values("stage").annotate(count=Count("id")).order_by("stage")),
        "tasks_completed_this_week": completed_week, "weekly_completion_percentage": round(completed_week / tasks_week.count() * 100, 1) if tasks_week.exists() else 0,
        "today_work_minutes": minutes(today), "today_learning_minutes": minutes(today, True), "current_month_work_minutes": minutes(month_start), "current_month_learning_minutes": minutes(month_start, True), "current_year_work_minutes": minutes(year_start), "current_year_learning_minutes": minutes(year_start, True),
        "recent_progress_logs": list(TaskProgressLog.objects.filter(owner=user).values("id", "task_id", "task__title", "log_date", "progress_after", "minutes_spent")[:10]),
        "recent_activity_logs": list(ActivityLog.objects.filter(owner=user).values("id", "activity_date", "title", "activity_type", "result", "minutes_spent", "related_task_id", "related_goal_id")[:10]),
        "recent_learning_sessions": list(LearningSession.objects.filter(owner=user).values("id", "session_date", "learning_item__title", "minutes_spent")[:10]),
        "recently_captured_links": list(CapturedLink.objects.filter(owner=user).values("id", "url", "status", "extracted_data", "created_at")[:10]),
        "upcoming_travel_plans": list(TravelPlan.objects.filter(owner=user, start_date__gte=today).exclude(status__in=["completed", "cancelled"]).values("id", "title", "destination", "start_date", "end_date", "status")[:10]),
        "notification_failures": list(Reminder.objects.filter(owner=user, status="failed").values("id", "reminder_type", "scheduled_at", "channel", "last_error")[:10]),
    })
