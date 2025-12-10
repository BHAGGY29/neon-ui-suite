from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import TrustedContact

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Missing username or password"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=400)

        user = User.objects.create_user(username=username, password=password)
        token = Token.objects.create(user=user)

        return Response({"message": "User registered", "token": token.key}, status=201)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"error": "Invalid credentials"}, status=400)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"message": "Login successful", "token": token.key}, status=200)


class AddTrustedContactView(APIView):
    def post(self, request):
        user = request.user
        name = request.data.get("name")
        phone = request.data.get("phone")

        if not name or not phone:
            return Response({"error": "Name and phone required"}, status=400)

        TrustedContact.objects.create(user=user, name=name, phone=phone)

        return Response({"message": "Trusted contact added"}, status=201)