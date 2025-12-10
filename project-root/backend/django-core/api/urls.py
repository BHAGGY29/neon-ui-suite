# api/urls.py (Replace the imports with this)
from django.urls import path
from .views import (
    CharacterListCreateView, 
    CharacterDetailView, 
    SOSTriggerView, 
    ChatAPIView
)

urlpatterns = [
    # Character Endpoints
    path('characters/', CharacterListCreateView.as_view(), name='character-list-create'),
    path('characters/<int:pk>/', CharacterDetailView.as_view(), name='character-detail'),
    
    # SOS Endpoint
    path('sos/trigger/', SOSTriggerView.as_view(), name='sos-trigger'), 
    
    # CHAT Endpoint
    path('chat/submit/', ChatAPIView.as_view(), name='chat-submit'), 
]