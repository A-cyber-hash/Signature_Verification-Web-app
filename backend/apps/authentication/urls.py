from django.urls import path
from .views import (
    SendPhoneOTPView, SendEmailOTPView,
    VerifyPhoneOTPView, VerifyEmailOTPView,
    DirectLoginView, RegisterView,
    RefreshTokenView, LogoutView, ResetPasswordView
)

urlpatterns = [
    path('login/', DirectLoginView.as_view(), name='direct-login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('otp/phone/send/', SendPhoneOTPView.as_view(), name='send-phone-otp'),
    path('otp/phone/verify/', VerifyPhoneOTPView.as_view(), name='verify-phone-otp'),
    path('otp/email/send/', SendEmailOTPView.as_view(), name='send-email-otp'),
    path('otp/email/verify/', VerifyEmailOTPView.as_view(), name='verify-email-otp'),
    path('password/reset/', ResetPasswordView.as_view(), name='password-reset'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
