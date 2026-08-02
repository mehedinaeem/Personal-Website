from django.urls import path

from .views import TelegramWebhookView

app_name = "reminders"
urlpatterns = [path("webhook/", TelegramWebhookView.as_view(), name="telegram-webhook")]
