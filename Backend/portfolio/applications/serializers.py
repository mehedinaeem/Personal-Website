"""
Serializers for Application model.
"""

from rest_framework import serializers
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for Application model with computed fields."""
    
    days_until_deadline = serializers.ReadOnlyField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Application
        fields = [
            'id',
            'title',
            'organization',
            'category',
            'category_display',
            'deadline',
            'result_date',
            'status',
            'status_display',
            'notes',
            'days_until_deadline',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_deadline(self, value):
        """Optionally validate deadline is not in the past for new applications."""
        # Allow past deadlines for tracking already submitted applications
        return value
