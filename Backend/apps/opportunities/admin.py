from django.contrib import admin
from .models import Application, Opportunity
admin.site.register((Opportunity, Application))
