from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from .models import LearningItem, LearningSession


class LearningItemSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = LearningItem
        fields = "__all__"
        read_only_fields = ("owner", "completed_hours", "created_at", "updated_at")

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        target = attrs.get("target_date", getattr(self.instance, "target_date", None))
        completed = attrs.get("completed_date", getattr(self.instance, "completed_date", None))
        if start and target and target < start:
            raise serializers.ValidationError({"target_date": "Target date cannot precede start date."})
        if completed and start and completed < start:
            raise serializers.ValidationError({"completed_date": "Completion date cannot precede start date."})
        if attrs.get("status") == "completed" and not completed:
            raise serializers.ValidationError({"completed_date": "Completed items require a completion date."})
        return attrs


class LearningSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningSession
        fields = "__all__"
        read_only_fields = ("owner", "learning_item", "created_at")

    @transaction.atomic
    def create(self, validated_data):
        item = LearningItem.objects.select_for_update().get(pk=self.context["learning_item"].pk)
        if item.owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("Learning item does not belong to you.")
        session = LearningSession.objects.create(owner=self.context["request"].user, learning_item=item, **validated_data)
        hours = Decimal(session.minutes_spent) / Decimal(60)
        LearningItem.objects.filter(pk=item.pk).update(completed_hours=F("completed_hours") + hours)
        return session
