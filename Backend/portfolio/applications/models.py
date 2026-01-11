"""
Application model for tracking job/scholarship/internship applications.
"""

from django.db import models


class Application(models.Model):
    """Model for tracking various applications with deadlines and status."""
    
    CATEGORY_CHOICES = [
        ('job', 'Job'),
        ('scholarship', 'Scholarship'),
        ('internship', 'Internship'),
        ('exam', 'Exam'),
        ('others', 'Others'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('applied', 'Applied'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
    ]
    
    title = models.CharField(max_length=255, help_text="Application title")
    organization = models.CharField(max_length=255, help_text="Company/Institution name")
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        default='job',
        help_text="Type of application"
    )
    deadline = models.DateField(help_text="Application deadline")
    result_date = models.DateField(
        null=True, 
        blank=True, 
        help_text="Expected result date (optional)"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        help_text="Current application status"
    )
    notes = models.TextField(blank=True, help_text="Additional notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['deadline', '-created_at']
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
    
    def __str__(self):
        return f"{self.title} - {self.organization} ({self.get_status_display()})"
    
    @property
    def days_until_deadline(self):
        """Calculate days remaining until deadline."""
        from django.utils import timezone
        today = timezone.now().date()
        delta = self.deadline - today
        return delta.days
