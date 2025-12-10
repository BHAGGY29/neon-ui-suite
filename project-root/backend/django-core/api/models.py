# api/models.py

from django.conf import settings
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

# --- 1. AI Character ---
class Character(models.Model):
    """Represents an AI character/agent."""
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="characters",
    )
    name = models.CharField(max_length=150)
    personality_prompt = models.TextField(help_text="Prompt used to guide the character's responses.")
    tags = models.JSONField(default=list, blank=True)
    is_public = models.BooleanField(default=True)
    fandom_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (by {self.creator.username})"

# --- 2. Chat Session ---
class ChatSession(models.Model):
    """A conversation session between a user and a character."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_sessions"
    )
    character = models.ForeignKey(Character, on_delete=models.CASCADE, related_name="chat_sessions")
    start_time = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-last_updated"]

    def __str__(self):
        return f"Session {self.id} - {self.user.username} x {self.character.name}"

# --- 3. Chat Message ---
class ChatMessage(models.Model):
    """Individual messages inside a ChatSession."""
    SENDER_USER = "user"
    SENDER_AI = "ai"
    SENDER_CHOICES = ((SENDER_USER, "User"), (SENDER_AI, "AI"))

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES, default=SENDER_USER)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"Message {self.id} ({self.sender}) in session {self.session_id}"

# --- 4. Safety Alert ---
class SafetyAlert(models.Model):
    """Records a distress/safety event triggered by the user or system."""
    ALERT_LOW = "low"
    ALERT_HIGH = "high"
    ALERT_LEVEL_CHOICES = (
        (ALERT_LOW, "Low"),
        (ALERT_HIGH, "High"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="safety_alerts")
    chat_session = models.ForeignKey(ChatSession, null=True, blank=True, on_delete=models.SET_NULL, related_name="safety_alerts_session")
    alert_level = models.CharField(max_length=10, choices=ALERT_LEVEL_CHOICES, default=ALERT_LOW)
    trigger_keywords = models.TextField(blank=True)
    risk_score = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(1.0)], default=0.0)
    is_resolved = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Alert {self.id} for {self.user.username} - {self.alert_level}"
        
# --- 5. Trusted Contact (Crucial for SOS) ---
class TrustedContact(models.Model):
    """Stores contact information for users to notify during an SOS event."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="api_trusted_contacts" # <-- THE FIX for E304/E305
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="Used for SMS alerts (e.g., Twilio)")
    priority_level = models.IntegerField(default=1, help_text="Lower number means higher priority")
    sos_enabled = models.BooleanField(default=True) 

    class Meta:
        # Ensures a user doesn't accidentally add the same email twice
        unique_together = ('user', 'email') 

    def __str__(self):
        return f"Contact {self.name} for {self.user.username}"