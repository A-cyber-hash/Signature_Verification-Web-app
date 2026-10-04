from django.urls import path

from .views import MeView, UserDirectoryView, UserStatusUpdateView

urlpatterns = [
    path('me/', MeView.as_view(), name='user-me'),
    path('<uuid:user_id>/status/', UserStatusUpdateView.as_view(), name='user-status-update'),
    path('', UserDirectoryView.as_view(), name='user-directory'),
]
