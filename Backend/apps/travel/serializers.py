from django.utils import timezone
from rest_framework import serializers

from .models import TravelChecklistItem, TravelItineraryItem, TravelPlan


class TravelPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelPlan
        fields = "__all__"
        read_only_fields = ("owner", "created_at", "updated_at")

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date cannot precede start date."})
        return attrs

    def create(self, validated_data):
        plan = super().create(validated_data)
        from apps.notifications.reminders import create_default_travel_reminders
        create_default_travel_reminders(plan)
        return plan

    def update(self, instance, validated_data):
        plan = super().update(instance, validated_data)
        from apps.notifications.reminders import cancel_defaults, create_default_travel_reminders
        if plan.default_reminders_enabled:
            create_default_travel_reminders(plan)
        else:
            cancel_defaults(plan, "travel_plan")
        return plan


class TravelItineraryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelItineraryItem
        fields = "__all__"
        read_only_fields = ("owner", "travel_plan", "created_at", "updated_at")

    def validate(self, attrs):
        plan = self.context["travel_plan"]
        if plan.owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("Travel plan does not belong to you.")
        if attrs["end_at"] < attrs["start_at"]:
            raise serializers.ValidationError({"end_at": "End time cannot precede start time."})
        if timezone.is_naive(attrs["start_at"]) or timezone.is_naive(attrs["end_at"]):
            raise serializers.ValidationError("Itinerary datetimes must include timezone information.")
        return attrs

    def create(self, validated_data):
        item = super().create(validated_data)
        from apps.notifications.reminders import create_default_itinerary_reminder
        create_default_itinerary_reminder(item, enabled=item.travel_plan.default_reminders_enabled)
        return item


class TravelChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelChecklistItem
        fields = "__all__"
        read_only_fields = ("owner", "travel_plan", "created_at", "updated_at")

    def validate(self, attrs):
        if self.context["travel_plan"].owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("Travel plan does not belong to you.")
        return attrs
