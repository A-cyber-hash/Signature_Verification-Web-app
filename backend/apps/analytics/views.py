import requests
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings


class AIAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt')
        if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 12000:
            return Response({'error': 'A valid analysis prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.ANTHROPIC_API_KEY:
            return Response({'error': 'AI analysis is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers={
                    'content-type': 'application/json',
                    'x-api-key': settings.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                },
                json={
                    'model': 'claude-3-5-sonnet-20241022',
                    'max_tokens': 1024,
                    'messages': [{'role': 'user', 'content': prompt}],
                },
                timeout=30,
            )
            response.raise_for_status()
            content = response.json().get('content', [])
            text = next((item.get('text') for item in content if item.get('type') == 'text'), None)
            if not text:
                return Response({'error': 'AI analysis returned an empty response.'}, status=status.HTTP_502_BAD_GATEWAY)
            return Response({'text': text})
        except requests.RequestException:
            return Response({'error': 'AI analysis service is currently unavailable.'}, status=status.HTTP_502_BAD_GATEWAY)