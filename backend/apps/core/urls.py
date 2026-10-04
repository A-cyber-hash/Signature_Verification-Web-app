from django.urls import path
from django.http import JsonResponse

def health(request):
    return JsonResponse({'status': 'ok', 'service': 'SignaSecure Enterprise'})

urlpatterns = [path('', health, name='health')]
