from calendar import month_abbr, monthrange
from collections import defaultdict
from datetime import date, datetime, time, timedelta

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone

from apps.learning.models import LearningItem, LearningSession
from apps.opportunities.models import Application
from apps.tasks.models import Task, TaskProgressLog
from apps.travel.models import TravelChecklistItem, TravelItineraryItem, TravelPlan
from .models import ActivityLog, Goal

CATEGORIES = ("research", "university", "career", "programming", "learning", "jkkniu_research_society", "personal", "travel", "other")


def parse_range(params):
    today = timezone.localdate()
    period = params.get("period", "30d")
    if period not in {"7d", "30d", "monthly", "yearly", "custom"}:
        raise ValueError("Invalid period.")
    if period == "custom":
        start, end = date.fromisoformat(params["start_date"]), date.fromisoformat(params["end_date"])
    elif period == "7d": start, end = today - timedelta(days=6), today
    elif period == "30d": start, end = today - timedelta(days=29), today
    elif period == "monthly":
        year, month = int(params.get("year", today.year)), int(params.get("month", today.month))
        start, end = date(year, month, 1), date(year, month, monthrange(year, month)[1])
    else:
        year = int(params.get("year", today.year)); start, end = date(year, 1, 1), date(year, 12, 31)
    if end < start or (end - start).days > 730:
        raise ValueError("Invalid date range.")
    return period, start, end


def aware_bounds(start, end):
    tz = timezone.get_current_timezone()
    return timezone.make_aware(datetime.combine(start, time.min), tz), timezone.make_aware(datetime.combine(end + timedelta(days=1), time.min), tz)


def analytics_data(user, params):
    period, start, end = parse_range(params)
    start_at, end_at = aware_bounds(start, end)
    category, activity_type, topic = params.get("category"), params.get("activity_type"), params.get("learning_topic")
    tasks = Task.objects.filter(owner=user, created_at__gte=start_at, created_at__lt=end_at)
    logs = TaskProgressLog.objects.filter(owner=user, log_date__range=(start, end))
    activities = ActivityLog.objects.filter(owner=user, activity_date__range=(start, end))
    sessions = LearningSession.objects.filter(owner=user, session_date__range=(start, end)).select_related("learning_item")
    goals = Goal.objects.filter(owner=user, start_date__lte=end, end_date__gte=start)
    if category:
        tasks, logs, activities, goals = tasks.filter(area=category), logs.filter(task__area=category), activities.filter(category=category), goals.filter(category=category)
    if activity_type: activities = activities.filter(activity_type=activity_type)
    if topic: sessions = sessions.filter(Q(learning_item__topic__iexact=topic) | Q(learning_item__skill__iexact=topic))
    tz = timezone.get_current_timezone()
    completed_by_day = dict_rows(tasks.filter(completed_at__gte=start_at, completed_at__lt=end_at).annotate(day=TruncDate("completed_at", tzinfo=tz)).values("day").annotate(value=Count("id")), "day")
    planned_by_day = dict_rows(tasks.annotate(day=TruncDate("created_at", tzinfo=tz)).values("day").annotate(value=Count("id")), "day")
    work_by_day = dict_rows(logs.values("log_date").annotate(value=Sum("minutes_spent")), "log_date")
    for row in activities.filter(related_task__isnull=True).values("activity_date").annotate(value=Sum("minutes_spent")):
        work_by_day[row["activity_date"]] = work_by_day.get(row["activity_date"], 0) + row["value"]
    learning_by_day = dict_rows(sessions.values("session_date").annotate(value=Sum("minutes_spent")), "session_date")
    goal_by_day = dict_rows(activities.filter(related_goal__isnull=False).values("activity_date").annotate(value=Count("id")), "activity_date")
    daily, cursor = [], start
    cumulative = 0
    while cursor <= end:
        planned, completed = planned_by_day.get(cursor, 0), completed_by_day.get(cursor, 0)
        work, learning, goal_count = work_by_day.get(cursor, 0), learning_by_day.get(cursor, 0), goal_by_day.get(cursor, 0)
        cumulative += learning
        # Balanced 0–100 score: tasks 30%, work 25%, learning 25%, documented goal progress 20%.
        score = min(30, completed * 10) + min(25, work / 240 * 25) + min(25, learning / 120 * 25) + min(20, goal_count * 10)
        daily.append({"date": cursor.isoformat(), "activity_score": round(score, 1), "intensity": intensity(score), "completed_tasks": completed, "planned_tasks": planned, "completion_percentage": round(completed / planned * 100, 1) if planned else (100 if completed else 0), "work_minutes": work, "learning_minutes": learning, "goal_progress_count": goal_count, "cumulative_learning_hours": round(cumulative / 60, 2)})
        cursor += timedelta(days=1)
    completed = sum(row["completed_tasks"] for row in daily); planned = sum(row["planned_tasks"] for row in daily)
    work_minutes = sum(row["work_minutes"] for row in daily); learning_minutes = sum(row["learning_minutes"] for row in daily)
    log_categories = {x["task__area"]: x["minutes"] for x in logs.values("task__area").annotate(minutes=Sum("minutes_spent"))}
    activity_categories = {x["category"]: x for x in activities.filter(related_task__isnull=True).values("category").annotate(minutes=Sum("minutes_spent"), completed=Count("id", filter=~Q(result="")))}
    task_categories = {x["area"]: x["completed"] for x in tasks.values("area").annotate(completed=Count("id", filter=Q(status="completed")))}
    category_data = [{"category": name, "minutes": (log_categories.get(name, 0) or 0) + (activity_categories.get(name, {}).get("minutes", 0) or 0), "completed_items": task_categories.get(name, 0) + activity_categories.get(name, {}).get("completed", 0)} for name in CATEGORIES]
    learning_topics = list(sessions.values("learning_item__topic", "learning_item__skill").annotate(minutes=Sum("minutes_spent")).order_by("-minutes"))
    travel = TravelPlan.objects.filter(owner=user, start_date__lte=end, end_date__gte=start).prefetch_related("checklist")
    goal_rows = [{"id": x.id, "title": x.title, "current_value": float(x.current_value), "target_value": float(x.target_value), "percentage": x.completion_percentage, "status": x.status, "end_date": x.end_date.isoformat()} for x in goals]
    monthly = monthly_rows(user, int(params.get("year", end.year)))
    active_categories = sorted(category_data, key=lambda x: x["minutes"], reverse=True)
    travel_rows = list(travel)
    result = {"period": period, "start_date": start.isoformat(), "end_date": end.isoformat(), "summary": {"completion_percentage": round(completed / planned * 100, 2) if planned else 0, "completed_tasks": completed, "planned_tasks": planned, "work_hours": round(work_minutes / 60, 2), "learning_hours": round(learning_minutes / 60, 2), "active_days": sum(bool(x["activity_score"]) for x in daily), "goals_completed": goals.filter(status="completed").count(), "most_active_category": active_categories[0]["category"] if active_categories and active_categories[0]["minutes"] else None, "main_unfinished_category": unfinished_category(tasks)}, "daily_trend": daily, "monthly_trend": monthly, "activity_heatmap": daily, "planned_vs_completed": weekly_rows(daily), "category_breakdown": category_data, "learning_by_topic": [{"topic": x["learning_item__topic"] or x["learning_item__skill"] or "Other", "minutes": x["minutes"], "hours": round(x["minutes"] / 60, 2)} for x in learning_topics], "learning_cumulative": [{"date": x["date"], "hours": x["cumulative_learning_hours"]} for x in daily], "learning_items": learning_items(user, sessions), "goal_progress": goal_rows, "activity_timeline": list(activities.select_related("related_task", "related_goal").values("id", "activity_date", "title", "activity_type", "result", "minutes_spent", "related_task__title", "related_goal__title").order_by("-activity_date")[:50]), "work_summary": {"total_minutes": work_minutes, "completed_results": activities.exclude(result="").count(), "blockers": activities.exclude(challenge="").count(), "lessons_learned": activities.exclude(lesson_learned="").count()}, "travel_timeline": [{"id": x.id, "title": x.title, "destination": x.destination, "purpose": x.purpose, "start_date": x.start_date.isoformat(), "end_date": x.end_date.isoformat(), "status": x.status, "checklist_completed": sum(item.is_completed for item in x.checklist.all()), "checklist_total": len(x.checklist.all()), "estimated_budget": float(x.estimated_budget), "currency": x.currency} for x in travel_rows], "travel_budget_comparison": [{"id": x.id, "label": x.title, "estimated": float(x.estimated_budget), "actual": float(x.actual_cost), "currency": x.currency} for x in travel_rows if x.status in {"ongoing", "completed"} and (x.estimated_budget or x.actual_cost)]}
    result["travel_calendar"] = travel_calendar(user, start, end, travel_rows)
    result["yearly_summary"] = yearly_summary(user, start, end, monthly, category_data, result["summary"])
    return result


def dict_rows(rows, key): return {row[key]: row["value"] or 0 for row in rows}
def intensity(score): return "none" if not score else "low" if score < 25 else "medium" if score < 50 else "high" if score < 75 else "very_high"
def weekly_rows(daily):
    result = defaultdict(lambda: {"planned": 0, "completed": 0})
    for row in daily:
        day = date.fromisoformat(row["date"]); key = f"Week {((day.day - 1) // 7) + 1}"
        result[key]["planned"] += row["planned_tasks"]; result[key]["completed"] += row["completed_tasks"]
    return [{"label": key, **value} for key, value in result.items()]
def unfinished_category(tasks):
    row = tasks.exclude(status__in=["completed", "cancelled"]).values("area").annotate(total=Count("id")).order_by("-total").first()
    return row["area"] if row else None
def learning_items(user, sessions):
    ids = sessions.values_list("learning_item_id", flat=True).distinct()
    return [{"id": x.id, "title": x.title, "status": x.status, "completed_hours": float(x.completed_hours), "target_hours": float(x.target_hours), "completion_percentage": x.completion_percentage, "confidence_before": x.confidence_before, "confidence_after": x.confidence_after} for x in LearningItem.objects.filter(owner=user, id__in=ids)]
def monthly_rows(user, year):
    start, end = date(year, 1, 1), date(year, 12, 31); a, b = aware_bounds(start, end); tz = timezone.get_current_timezone()
    task_rows = {x["month"].month: x for x in Task.objects.filter(owner=user, created_at__gte=a, created_at__lt=b).annotate(month=TruncMonth("created_at", tzinfo=tz)).values("month").annotate(planned=Count("id"), completed=Count("id", filter=Q(status="completed")))}
    log_rows = {x["month"].month: x["minutes"] for x in TaskProgressLog.objects.filter(owner=user, log_date__range=(start, end)).annotate(month=TruncMonth("log_date")).values("month").annotate(minutes=Sum("minutes_spent"))}
    activity_rows = {x["month"].month: x["minutes"] for x in ActivityLog.objects.filter(owner=user, activity_date__range=(start, end), related_task__isnull=True).annotate(month=TruncMonth("activity_date")).values("month").annotate(minutes=Sum("minutes_spent"))}
    learning_rows = {x["month"].month: x["minutes"] for x in LearningSession.objects.filter(owner=user, session_date__range=(start, end)).annotate(month=TruncMonth("session_date")).values("month").annotate(minutes=Sum("minutes_spent"))}
    result = []
    for month in range(1, 13):
        task = task_rows.get(month, {}); planned, completed = task.get("planned", 0), task.get("completed", 0); work = (log_rows.get(month, 0) or 0) + (activity_rows.get(month, 0) or 0)
        result.append({"month": month_abbr[month], "month_number": month, "completion_percentage": round(completed / planned * 100, 1) if planned else 0, "work_hours": round(work / 60, 2), "learning_hours": round((learning_rows.get(month, 0) or 0) / 60, 2)})
    return result
def yearly_summary(user, start, end, monthly, categories, summary):
    return {"completed_tasks": Task.objects.filter(owner=user, completed_at__date__range=(start, end)).count(), "completed_goals": Goal.objects.filter(owner=user, status="completed", completed_at__date__range=(start, end)).count(), "work_hours": summary["work_hours"], "learning_hours": summary["learning_hours"], "active_days": summary["active_days"], "best_month": max(monthly, key=lambda x: x["completion_percentage"])["month"] if monthly else None, "most_active_category": max(categories, key=lambda x: x["minutes"])["category"] if categories else None, "opportunities_applied": Application.objects.filter(owner=user, applied_at__date__range=(start, end)).count(), "completed_travel_plans": TravelPlan.objects.filter(owner=user, status="completed", end_date__range=(start, end)).count()}


def travel_calendar(user, start, end, plans):
    rows = [{"kind": "travel", "id": x.id, "label": x.title, "start": x.start_date.isoformat(), "end": x.end_date.isoformat()} for x in plans]
    rows += [{"kind": "itinerary", "id": x.id, "label": x.title, "start": x.start_at.isoformat(), "end": x.end_at.isoformat(), "travel_plan_id": x.travel_plan_id} for x in TravelItineraryItem.objects.filter(owner=user, start_at__date__lte=end, end_at__date__gte=start)]
    rows += [{"kind": "checklist", "id": x.id, "label": x.title, "start": x.due_at.isoformat(), "end": x.due_at.isoformat(), "travel_plan_id": x.travel_plan_id} for x in TravelChecklistItem.objects.filter(owner=user, due_at__date__range=(start, end))]
    return sorted(rows, key=lambda x: x["start"])
