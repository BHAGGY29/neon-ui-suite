# digital_safety/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# -----------------------------------------------------------------
from rest_framework_simplejwt.views import TokenBlacklistView # <-- IMPORTED FOR LOGOUT
# -----------------------------------------------------------------
from django.http import JsonResponse

# --- 1. DRF Router Setup ---
router = routers.DefaultRouter()
# router.register(r'users', UserViewSet, basename='user') 


# --- 2. Public Home View ---
def home(request):
    """View to confirm the Django server is running."""
    return JsonResponse({"message": "Welcome to Digital Safety! Server is running."})


# --- 3. Main URL Patterns ---
urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # Root Path
    path("", home, name="home"),
    
    # JWT Authentication Endpoints
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # LOGOUT ENDPOINT (Blacklists the token)
    path("api/auth/logout/", TokenBlacklistView.as_view(), name="token_blacklist"), # <-- LOGOUT PATH
    
    # API Version 1 Routes (Character, Chat, SOS logic)
    path("api/v1/", include('api.urls')),
    
    # DRF Router
    # path("api/", include(router.urls)), 
]