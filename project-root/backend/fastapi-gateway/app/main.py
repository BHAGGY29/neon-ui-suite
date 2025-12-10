from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import components, auth_proxy

app = FastAPI(title="Neon UI Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod to your frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_proxy.router, prefix="/auth", tags=["auth"])
app.include_router(components.router, prefix="/components", tags=["components"])
