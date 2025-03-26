from fastapi import APIRouter

from .auth.routes import router as auth_router
from .users.routes import router as users_router
from .roles.routes import router as roles_router
from .documents.routes import router as documents_router
from .patients.routes import router as patients_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(roles_router, prefix="/roles", tags=["roles"])
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
api_router.include_router(patients_router, prefix="/patients", tags=["patients"]) 