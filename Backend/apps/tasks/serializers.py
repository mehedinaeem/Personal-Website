from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import serializers

from .models import DailyReview, Task, TaskProgressLog


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ("owner", "completed_at", "created_at", "updated_at", "actual_minutes")

    def validate(self, attrs):
        start_at = attrs.get("start_at", getattr(self.instance, "start_at", None))
        due_at = attrs.get("due_at", getattr(self.instance, "due_at", None))
        if start_at and timezone.is_naive(start_at):
            raise serializers.ValidationError({"start_at": "Datetime must include timezone information."})
        if due_at and timezone.is_naive(due_at):
            raise serializers.ValidationError({"due_at": "Datetime must include timezone information."})
        if start_at and due_at and due_at < start_at:
            raise serializers.ValidationError({"due_at": "Due time cannot be earlier than start time."})
        return attrs


class TaskProgressLogSerializer(serializers.ModelSerializer):
    allow_progress_decrease = serializers.BooleanField(write_only=True, default=False)

    class Meta:
        model = TaskProgressLog
        fields = (
            "id", "task", "owner", "log_date", "progress_before", "progress_after",
            "work_completed", "blocker", "next_step", "minutes_spent", "created_at",
            "allow_progress_decrease",
        )
        read_only_fields = ("task", "owner", "progress_before", "created_at")

    def validate(self, attrs):
        task = self.context["task"]
        request = self.context["request"]
        if task.owner_id != request.user.id:
            raise serializers.ValidationError("The selected task does not belong to you.")
        if attrs["progress_after"] < task.progress_percentage and not attrs.pop(
            "allow_progress_decrease", False
        ):
            raise serializers.ValidationError(
                {"progress_after": "Progress cannot decrease unless explicitly allowed."}
            )
        attrs.pop("allow_progress_decrease", None)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        task = Task.objects.select_for_update().get(pk=self.context["task"].pk)
        log = TaskProgressLog.objects.create(
            task=task,
            owner=self.context["request"].user,
            progress_before=task.progress_percentage,
            **validated_data,
        )
        Task.objects.filter(pk=task.pk).update(
            progress_percentage=log.progress_after,
            actual_minutes=F("actual_minutes") + log.minutes_spent,
            updated_at=timezone.now(),
        )
        return log


class DailyReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyReview
        fields = "__all__"
        read_only_fields = ("owner", "created_at", "updated_at")

    def validate_review_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Review date cannot be in the future.")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        review_date = attrs.get("review_date", getattr(self.instance, "review_date", None))
        queryset = DailyReview.objects.filter(owner=request.user, review_date=review_date)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError({"review_date": "A review already exists for this date."})
        return attrs
