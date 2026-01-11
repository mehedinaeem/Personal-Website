"""
Admin configuration for Application model.
"""

from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    """Admin interface for Application model."""
    
    list_display = [
        'title', 
        'organization', 
        'category', 
        'status', 
        'deadline', 
        'days_until_deadline',
        'result_date',
        'created_at'
    ]
    list_filter = ['category', 'status', 'deadline']
    search_fields = ['title', 'organization', 'notes']
    ordering = ['deadline']
    date_hierarchy = 'deadline'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'organization', 'category')
        }),
        ('Dates', {
            'fields': ('deadline', 'result_date')
        }),
        ('Status & Notes', {
            'fields': ('status', 'notes')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
