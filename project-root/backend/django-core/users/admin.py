from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import TrustedContact

User = get_user_model()

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Extra", {"fields": ("display_name", "bio")}),
    )

@admin.register(TrustedContact)
class TrustedContactAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "email", "phone_number",)
    list_filter = ("user",)
    search_fields = ("name", "email", "phone_number")

