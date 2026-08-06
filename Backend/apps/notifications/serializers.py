from django.utils import timezone
from rest_framework import serializers

from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = "__all__"
        read_only_fields = ("owner", "status", "attempt_count", "last_error", "sent_at", "created_at", "updated_at")

    def validate(self, attrs):
        owner = self.context["request"].user
        instance = self.instance
        scheduled = attrs.get("scheduled_at", getattr(instance, "scheduled_at", None))
        if scheduled and timezone.is_naive(scheduled):
            raise serializers.ValidationError({"scheduled_at": "Reminder time must include timezone information."})
        if scheduled and scheduled <= timezone.now():
            raise serializers.ValidationError({"scheduled_at": "Reminder time must be in the future."})
        references = []
        for name in Reminder.REFERENCES:
            value = attrs.get(name, getattr(instance, name, None))
            references.append(value)
            if value and value.owner_id != owner.id:
                raise serializers.ValidationError({name: "Referenced object must belong to you."})
        reminder_type = attrs.get("reminder_type", getattr(instance, "reminder_type", None))
        if reminder_type != "custom" and not any(references):
            raise serializers.ValidationError("A non-custom reminder must reference a supported object.")
        filters = {name: value for name, value in zip(Reminder.REFERENCES, references)}
        filters.update(owner=owner, reminder_type=reminder_type, scheduled_at=scheduled, channel=attrs.get("channel", getattr(instance, "channel", "telegram")))
        duplicates = Reminder.objects.filter(**filters)
        if instance:
            duplicates = duplicates.exclude(pk=instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError("An identical reminder already exists.")
        return attrs
