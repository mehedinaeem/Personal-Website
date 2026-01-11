"""
Management command to create a superuser if one doesn't exist.
Used for Render deployment since free tier doesn't have shell access.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = 'Create a superuser if one does not exist'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from environment or use defaults
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'mehedinaeem')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'mehedinaeem00@gmail.com')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'jkkniu1234')
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser "{username}" already exists. Skipping.')
            )
        else:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" created successfully!')
            )
