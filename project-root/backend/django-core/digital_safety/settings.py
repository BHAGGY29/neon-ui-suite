import os
import logging
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
import sys # Import sys for potential debug checks

# =======================================================
# 1. LOAD ENVIRONMENT VARIABLES (MUST BE FIRST)
# =======================================================
# This loads everything from your local .env file immediately
load_dotenv() 

# Set up logging for settings warnings
logger = logging.getLogger(__name__)

# =======================================================
# 2. CORE DJANGO SETTINGS (Read from ENV)
# =======================================================
BASE_DIR = Path(__file__).resolve().parent.parent

# Read SECRET_KEY and DEBUG from .env
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "your-fallback-secret-key-for-dev")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

# Default ALLOWED_HOSTS is broad for easy deployment
ALLOWED_HOSTS = ["*"] 

# =======================================================
# 3. APPS AND MIDDLEWARE
# =======================================================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    # Third-party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    
    # Your local apps
    "users",
    "api",
]

MIDDLEWARE = [
    # Security and WhiteNoise (must be near the top)
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware', # ADDED FOR PRODUCTION STATIC FILES
    
    # Other middleware
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware", # Recommended to add this
]

ROOT_URLCONF = "digital_safety.urls"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "users.User"

# =======================================================
# 4. DATABASE CONFIGURATION
# =======================================================

# A. Default Local Database (MySQL)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "digital_safety",
        "USER": "root",
        "PASSWORD": "Bhas@2925",
        "HOST": "127.0.0.1",
        "PORT": "3306",
        "OPTIONS": {
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# B. Production Database Override (For Railway)
# If DATABASE_URL is found (set by Railway), override the default MySQL settings.
if os.environ.get('DATABASE_URL'):
    DATABASES['default'] = dj_database_url.config(
        conn_max_age=600, 
        conn_health_checks=True,
    )
    # Ensure DEBUG is False in production, regardless of what the .env file says
    DEBUG = False
    
# =======================================================
# 5. TEMPLATES
# =======================================================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# =======================================================
# 6. REST FRAMEWORK & CORS
# =======================================================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny", 
    ],
}

CORS_ALLOWED_ORIGINS = [
    # Local Frontend URLs
    "http://localhost:8080", 
    "http://192.168.29.10:8080",
    # When deployed, you will add your Railway domain here if needed
]


# =======================================================
# 7. STATIC FILES (WhiteNoise Configuration)
# =======================================================
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles" # Location where `collectstatic` puts files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage' # WhiteNoise storage backend


# =======================================================
# 8. EMAIL CONFIGURATION (Read from ENV)
# =======================================================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend' 
EMAIL_HOST = os.environ.get('EMAIL_HOST')
# Ensure Port is read safely
try:
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 465))
except ValueError:
    EMAIL_PORT = 465 # Default to 465 if env var is bad
    
EMAIL_USE_TLS = False # TLS disabled for Port 465
EMAIL_USE_SSL = True  # SSL enabled for Port 465
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER) 

# Fallback check and DEBUG prints (Only run if the server starts)
if DEBUG and 'runserver' in sys.argv:
    if not EMAIL_HOST or not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD:
        logger.warning("Email environment variables not set. Emails will fail.")
        print("FATAL DEBUG: EMAIL CREDENTIALS ARE EMPTY! Check .env file.")
    else:
        print(f"DEBUG: Email Host User: {EMAIL_HOST_USER}")
        print(f"DEBUG: Using SSL on Port: {EMAIL_PORT}")