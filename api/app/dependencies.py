from fastapi import Depends, HTTPException, status
from .auth import get_current_active_user
from .models import User
from .roles import Resource, Action, has_permission
from functools import wraps

def require_permission(resource: Resource, action: Action):
    """
    Dependency factory that checks if the current user has the required permission.
    Usage:
        @app.get("/users")
        async def get_users(
            _=Depends(require_permission(Resource.USERS, Action.READ))
        ):
            ...
    """
    async def permission_dependency(
        current_user: User = Depends(get_current_active_user)
    ) -> None:
        if not has_permission(current_user.role, resource, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough permissions to {action} {resource}"
            )
        return current_user
    
    return permission_dependency

def check_permissions(resource: Resource, action: Action):
    """
    Decorator for checking permissions in route handlers.
    Usage:
        @app.get("/users")
        @check_permissions(Resource.USERS, Action.READ)
        async def get_users():
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get the current user from the kwargs
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not authenticated"
                )
            
            if not has_permission(current_user.role, resource, action):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Not enough permissions to {action} {resource}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator 