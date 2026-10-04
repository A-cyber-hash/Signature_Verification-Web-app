from django.urls import path
from .views import SignatureVerifyView, SignatureTemplateListView, SignatureEnrollView, SignatureComparisonView

urlpatterns = [
    path("verify/",     SignatureVerifyView.as_view(),       name="verify-signature"),
    path("templates/",  SignatureTemplateListView.as_view(), name="verification-templates"),
    path("enroll/",     SignatureEnrollView.as_view(),       name="enroll-signature"),
    path("compare/",    SignatureComparisonView.as_view(),   name="compare-signatures"),
]
