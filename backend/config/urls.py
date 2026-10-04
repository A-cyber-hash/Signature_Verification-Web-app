"""
SignaSecure Enterprise URL Configuration
Production-ready URL patterns with API versioning
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# Admin customization
admin.site.site_header = 'SignaSecure Enterprise Administration'
admin.site.site_title = 'SignaSecure Admin'
admin.site.index_title = 'Welcome to SignaSecure Enterprise'

urlpatterns = [
    # Admin
    path(settings.ADMIN_URL, admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # OAuth2
    # path('auth/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    
    # API v1 Routes
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/signatures/', include('apps.signatures.urls')),
    path('api/v1/verification/', include('apps.verification.urls')),
    path('api/v1/fraud/', include('apps.fraud_detection.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    
    # Health Check
    path('health/', include('apps.core.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)