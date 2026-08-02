from django.utils import timezone
from rest_framework import serializers

from .models import CapturedLink


class ExtractRequestSerializer(serializers.Serializer):
    url = serializers.URLField(max_length=2048)


class CapturedLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapturedLink
        fields = "__all__"
        read_only_fields = (
            "owner", "url", "normalized_url", "source_platform", "status", "raw_metadata",
            "extracted_data", "error_message", "created_at", "updated_at",
        )

    def validate_created_opportunity(self, value):
        if value and value.owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("Opportunity must belong to you.")
        return value

    def update(self, instance, validated_data):
        if validated_data.get("created_opportunity"):
            validated_data["reviewed_at"] = timezone.now()
            instance.status = "reviewed"
            instance.save(update_fields=["status", "updated_at"])
        return super().update(instance, validated_data)
