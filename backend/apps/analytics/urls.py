from django.urls import path
from .views import AIAnalysisView

urlpatterns = [
	path('ai-analysis/', AIAnalysisView.as_view(), name='ai-analysis'),
]
