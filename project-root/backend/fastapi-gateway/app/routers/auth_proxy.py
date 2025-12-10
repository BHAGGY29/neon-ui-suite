from fastapi import APIRouter
import httpx
import os

router = APIRouter()

DJANGO_BASE = f"http://{os.getenv('DJANGO_HOST', 'django')}:{os.getenv('DJANGO_PORT', '8001')}"

@router.post("/login")
async def login_proxy(payload: dict):
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{DJANGO_BASE}/api/token/", json=payload)
        return r.json()
