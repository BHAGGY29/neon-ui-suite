# api/views.py

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Character, ChatSession, ChatMessage, TrustedContact, SafetyAlert
from users.models import User as UserProfile
from .serializers import (
    CharacterSerializer, 
    ChatRequestSerializer, 
    ChatMessageSerializer, 
    SOSRequestSerializer, 
    SOSResponseSerializer
)
# --- IMPORT THE HELPER FUNCTION FROM UTILS ---
from .utils import notify_trusted_contacts as send_sos_notifications 


# --- 1. Character Views ---
class CharacterListCreateView(generics.ListCreateAPIView):
    """GET: List all public characters. POST: Create a new character (requires authentication)."""
    queryset = Character.objects.filter(is_public=True).order_by('-fandom_score', 'name')
    serializer_class = CharacterSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] 
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class CharacterDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single character management."""
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] 


# --- 2. SOS View ---
class SOSTriggerView(APIView):
    """Endpoint to trigger an SOS alert, save the alert, and notify trusted contacts."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = SOSRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            user = UserProfile.objects.get(id=data['user_id']) 
        except UserProfile.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
        alert = SafetyAlert.objects.create(
            user=user,
            alert_level=data['risk_level'],
            risk_score=1.0, 
            trigger_keywords=f"SOS Initiated. Source: {data.get('source_character', 'Unknown')}",
            is_resolved=False
        )
        
        contacts = TrustedContact.objects.filter(user=user, sos_enabled=True)
        
        # Calling the function imported from utils.py
        contacts_notified = send_sos_notifications(
            user=user, 
            contacts=contacts, 
            latitude=data.get('location', {}).get('latitude'),
            longitude=data.get('location', {}).get('longitude'),
            message=data.get('message')
        )
            
        response_serializer = SOSResponseSerializer(data={
            "success": True,
            "alert_id": alert.id,
            "contacts_notified": contacts_notified,
            "message": f"Alert saved. {contacts_notified} contacts notified successfully.",
        })
        response_serializer.is_valid(raise_exception=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


# --- 3. Chat View ---
class ChatAPIView(APIView):
    """Handles user message submission, LLM interaction, and chat history management."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user = request.user
        
        session_id = data.get('session_id')
        character_id = data['character_id']
        
        if session_id:
            session = get_object_or_404(ChatSession, id=session_id, user=user)
            character = session.character
        else:
            character = get_object_or_404(Character, id=character_id)
            session = ChatSession.objects.create(user=user, character=character)
            
        ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.SENDER_USER,
            content=data['message']
        )
        
        # --- LLM PLACEHOLDER ---
        ai_response = f"Hello {user.username}, I am {character.name}. Thank you for your message in session {session.id}. (LLM integration pending)"
        
        ai_message = ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.SENDER_AI,
            content=ai_response
        )
        
        return Response({
            'session_id': session.id,
            'character_name': character.name,
            'ai_response': ChatMessageSerializer(ai_message).data,
        }, status=status.HTTP_200_OK)