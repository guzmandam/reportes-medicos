from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .core.init_db import init_db
from .api.api_v1.api import api_router
from .api.api_v1.health import router as health_router

app = FastAPI(title="Medical Records API")
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers from the API
app.include_router(api_router, prefix="/api/v1")
app.include_router(health_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Medical Records API"}

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db() 