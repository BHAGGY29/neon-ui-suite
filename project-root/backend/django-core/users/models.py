from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)

    def _str_(self):
        return self.username


class TrustedContact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trusted_contacts")
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()

    def _str_(self):
        return f"{self.name} ({self.phone_number})"