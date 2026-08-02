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


class TravelChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelChecklistItem
        fields = "__all__"
        read_only_fields = ("owner", "travel_plan", "created_at", "updated_at")

    def validate(self, attrs):
        if self.context["travel_plan"].owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("Travel plan does not belong to you.")
        return attrs
