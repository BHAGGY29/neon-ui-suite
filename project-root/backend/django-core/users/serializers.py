# api/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Character, ChatSession, SafetyAlert, TrustedContact, ChatMessage
# Ensure all models are imported: ^^^^^^^^^^^^^^^^^^^^^^^

# Get the active User model defined in settings.AUTH_USER_MODEL
User = get_user_model()


# --- User Serializer ---
class UserSerializer(serializers.ModelSerializer):
    """Serializer for the custom User model (users.User)."""
    class Meta:
        model = User
        fields = ["id", "username", "email", "bio"]
        read_only_fields = ["id", "username", "email", "bio"] 


# --- 1. Character Serializer ---
class CharacterSerializer(serializers.ModelSerializer):
    """Serializer for the Character model."""
    creator_username = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = Character
        fields = [
            'id', 'creator', 'creator_username', 'name', 'personality_prompt', 'tags', 
            'is_public', 'fandom_score', 'created_at'
        ]
        read_only_fields = ['id', 'creator_username', 'created_at', 'fandom_score']


# --- 2. Chat Serializers ---
class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for displaying individual messages."""
    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'sender', 'content', 'timestamp']
        read_only_fields = ['id', 'session', 'sender', 'timestamp']


class ChatRequestSerializer(serializers.Serializer):
    """Validates the data sent by the user to start or continue a chat."""
    character_id = serializers.IntegerField(required=True)
    session_id = serializers.IntegerField(required=False, allow_null=True)
    message = serializers.CharField(required=True)


# --- 3. SOS Serializers ---
class LocationSerializer(serializers.Serializer):
    """Serializer for nested location data."""
    latitude = serializers.FloatField(required=True)
    longitude = serializers.FloatField(required=True)
    accuracy = serializers.FloatField(required=False)


class SOSRequestSerializer(serializers.Serializer):
    """Validates the incoming payload from the frontend's SOS trigger."""
    user_id = serializers.IntegerField(required=True) 
    message = serializers.CharField(required=False, allow_blank=True) 
    risk_level = serializers.CharField(required=True, max_length=10) 
    location = LocationSerializer(required=False)
    source_character = serializers.CharField(required=False, allow_blank=True) 
    
    
class SOSResponseSerializer(serializers.Serializer):
    """Standardizes the response structure sent back to the frontend."""
    success = serializers.BooleanField()
    alert_id = serializers.IntegerField(allow_null=True)
    contacts_notified = serializers.IntegerField()
jango-core/users/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TrustedContact

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "display_name", "bio")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "display_name")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class TrustedContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustedContact
        fields = ("id", "name", "email", "phone_number", "created_at")
        read_only_fields = ("id", "created_at")


