from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.progress.models import ActivityLog
from .models import Application, Opportunity


class OpportunitySerializer(serializers.ModelSerializer):
    is_deadline_passed = serializers.BooleanField(read_only=True)
    has_applied = serializers.SerializerMethodField()
    user_application_id = serializers.SerializerMethodField()

    class Meta:
        model = Opportunity
        fields = "__all__"
        read_only_fields = ("owner", "created_at", "updated_at")

    def get_has_applied(self, obj):
        if hasattr(obj, "current_user_applications"):
            return bool(obj.current_user_applications)
        if hasattr(obj, "user_application_count"):
            return bool(obj.user_application_count)
        return obj.applications.exists()

    def get_user_application_id(self, obj):
        if hasattr(obj, "current_user_applications"):
            return obj.current_user_applications[0].id if obj.current_user_applications else None
        application = obj.applications.filter(owner=self.context["request"].user).only("id").first()
        return application.id if application else None

    def validate_deadline(self, value):
        if value and timezone.is_naive(value):
            raise serializers.ValidationError("Deadline must include timezone information.")
        return value


def validate_checklist(value):
    if not isinstance(value, list):
        raise serializers.ValidationError("Documents checklist must be a list.")
    for item in value:
        if isinstance(item, str):
            continue
        if not isinstance(item, dict) or not isinstance(item.get("name"), str) or not isinstance(item.get("completed", False), bool):
            raise serializers.ValidationError("Each checklist item must be text or an object with name and completed fields.")
    return value


class ApplicationSerializer(serializers.ModelSerializer):
    opportunity_title = serializers.CharField(source="opportunity.title", read_only=True)
    organization = serializers.CharField(source="opportunity.organization", read_only=True)
    documents_checklist = serializers.JSONField(validators=[validate_checklist], required=False)

    class Meta:
        model = Application
        fields = "__all__"
        read_only_fields = ("owner", "submission_activity", "created_at", "updated_at")

    def validate_opportunity(self, value):
        if value.owner_id != self.context["request"].user.id:
            raise serializers.ValidationError("Opportunity must belong to you.")
        return value

    def validate(self, attrs):
        opportunity = attrs.get("opportunity", getattr(self.instance, "opportunity", None))
        if not self.instance and Application.objects.filter(
            owner=self.context["request"].user, opportunity=opportunity
        ).exists():
            raise serializers.ValidationError("An application already exists for this opportunity.")
        stage = attrs.get("stage", getattr(self.instance, "stage", "saved"))
        applied_at = attrs.get("applied_at", getattr(self.instance, "applied_at", None))
        if stage == "applied" and not applied_at:
            attrs["applied_at"] = timezone.now()
        return attrs

    def create(self, validated_data):
        application = super().create(validated_data)
        return mark_application_applied(application) if application.stage == "applied" else application

    def update(self, instance, validated_data):
        application = super().update(instance, validated_data)
        return mark_application_applied(application) if application.stage == "applied" else application


@transaction.atomic
def mark_application_applied(application):
    application = Application.objects.select_for_update().select_related("opportunity").get(pk=application.pk)
    application.stage = "applied"
    application.applied_at = application.applied_at or timezone.now()
    if not application.submission_activity_id:
        activity = ActivityLog.objects.create(
            owner=application.owner,
            activity_date=timezone.localdate(),
            title=f"Submitted application: {application.opportunity.title}",
            description=f"Application submitted to {application.opportunity.organization}.",
            category="career",
            activity_type="application",
            minutes_spent=0,
            progress_value=100,
            result="Application submitted",
        )
        application.submission_activity = activity
    application.save(update_fields=["stage", "applied_at", "submission_activity", "updated_at"])
    return application
