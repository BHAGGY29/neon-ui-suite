from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Component(BaseModel):
    id: str
    name: str
    description: str
    props: dict = {}

# simple in-memory demo list (replace with call to Django microservice)
DEMO = [
    {"id": "btn-1", "name": "NeonButton", "description": "A glowing CTA"},
    {"id": "card-1", "name": "NeonCard", "description": "Fancy card"}
]

@router.get("/", response_model=List[Component])
async def list_components():
    return DEMO

@router.get("/{component_id}", response_model=Component)
async def get_component(component_id: str):
    for c in DEMO:
        if c["id"] == component_id:
            return c
    raise HTTPException(status_code=404, detail="Component not found")
