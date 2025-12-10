# api/admin.py

from django.contrib import admin
from .models import (
    Character,
    ChatSession,
    ChatMessage,
    SafetyAlert, # <--- Corrected name: SafetyAlert
    TrustedContact
)

# --- 1. Character Admin ---
@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'is_public', 'fandom_score', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'personality_prompt')
    raw_id_fields = ('creator',) # Use a widget for user selection

# --- 2. Chat Session Admin ---
class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    readonly_fields = ('sender', 'content', 'timestamp')
    can_delete = False
    max_num = 0 # Don't allow adding via the session admin; view only

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'character', 'start_time', 'last_updated')
    list_filter = ('character', 'start_time')
    search_fields = ('user__username', 'character__name')
    inlines = [ChatMessageInline]

# --- 3. Safety Alert Admin ---
@admin.register(SafetyAlert)
class SafetyAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'alert_level', 'is_resolved', 'timestamp', 'trigger_keywords')
    list_filter = ('alert_level', 'is_resolved')
    search_fields = ('user__username', 'trigger_keywords')
    list_editable = ('is_resolved',)

# --- 4. Trusted Contact Admin ---
@admin.register(TrustedContact)
class TrustedContactAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'email', 'phone_number', 'sos_enabled', 'priority_level')
    list_filter = ('sos_enabled',)
    search_fields = ('user__username', 'name', 'email')
    list_editable = ('sos_enabled', 'priority_level')