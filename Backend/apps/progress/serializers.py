from datetime import datetime, time, timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from apps.tasks.models import Task, TaskProgressLog
from .models import ActivityLog, Goal, ProgressReview


class GoalSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Goal
        fields = "__all__"
        read_only_fields = ("owner", "completed_at", "created_at", "updated_at")

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date cannot precede start date."})
        user = self.context["request"].user
        for task in attrs.get("related_tasks", []):
            if task.owner_id != user.id:
                raise serializers.ValidationError({"related_tasks": "Related tasks must belong to you."})
        return attrs


def review_metrics(user, start, end):
    tz = timezone.get_current_timezone()
    start_at = timezone.make_aware(datetime.combine(start, time.min), tz)
    end_at = timezone.make_aware(datetime.combine(end + timedelta(days=1), time.min), tz)
    tasks = Task.objects.filter(owner=user, created_at__lt=end_at)
    completed = tasks.filter(completed_at__gte=start_at, completed_at__lt=end_at)
    task_minutes = TaskProgressLog.objects.filter(owner=user, log_date__range=(start, end)).aggregate(total=Sum("minutes_spent"))["total"] or 0
    activity_minutes = ActivityLog.objects.filter(owner=user, activity_date__range=(start, end), related_task__isnull=True).aggregate(total=Sum("minutes_spent"))["total"] or 0
    return {"planned_items_count": tasks.count(), "completed_items_count": completed.count(), "total_minutes_spent": task_minutes + activity_minutes}


class ProgressReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressReview
        fields = "__all__"
        read_only_fields = ("owner", "created_at", "updated_at")

    def validate(self, attrs):
        start = attrs.get("period_start", getattr(self.instance, "period_start", None))
        end = attrs.get("period_end", getattr(self.instance, "period_end", None))
        if start and end and end < start:
            raise serializers.ValidationError({"period_end": "Period end cannot precede period start."})
        user = self.context["request"].user
        period = attrs.get("period_type", getattr(self.instance, "period_type", None))
        duplicate = ProgressReview.objects.filter(owner=user, period_type=period, period_start=start, period_end=end)
        if self.instance:
            duplicate = duplicate.exclude(pk=self.instance.pk)
        if duplicate.exists():
            raise serializers.ValidationError("A review already exists for this period.")
        return attrs

    def create(self, validated_data):
        metrics = review_metrics(self.context["request"].user, validated_data["period_start"], validated_data["period_end"])
        for key, value in metrics.items():
            validated_data.setdefault(key, value)
        return super().create(validated_data)


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = "__all__"
        read_only_fields = ("owner", "created_at", "updated_at")

    def validate(self, attrs):
        user = self.context["request"].user
        for field in ("related_task", "related_goal"):
            related = attrs.get(field)
            if related and related.owner_id != user.id:
                raise serializers.ValidationError({field: "Related record must belong to you."})
        return attrs
