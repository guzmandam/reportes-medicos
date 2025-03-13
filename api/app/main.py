from datetime import timedelta
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from .models import User, UserCreate, Token, UserLogin, UserInDB, Role, RoleCreate, RoleUpdate, Resource, Action
from .auth import (
    get_current_active_user,
    create_access_token,
    authenticate_user,
    get_password_hash
)
from .database import users, roles
from .config import get_settings
from bson import ObjectId

app = FastAPI(title="Medical Records API")
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/login")
async def login(user_credentials: UserLogin):
    user = authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Convert user object to dict and remove sensitive data
    user_dict = user.model_dump()
    user_dict.pop("hashed_password", None)

    print(user_dict)    
    
    # Ensure id is present and correctly formatted
    if "_id" in user_dict:
        user_dict["id"] = str(user_dict.pop("_id"))
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**user_dict)
    }

@app.post("/auth/signup", response_model=User)
async def signup(user: UserCreate):
    if existing_user := users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create a UserInDB object
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password

    user_db = UserInDB(**user_dict)
    
    result = users.insert_one(user_db.model_dump())
    return_user = user_db.model_dump()
    return_user["id"] = str(result.inserted_id)
    
    return User(**return_user)

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users", response_model=User)
async def create_user(user: UserCreate):
    if existing_user := users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    
    result = users.insert_one(user_dict)
    # Properly convert ObjectId to string
    user_dict["id"] = str(result.inserted_id)
    
    return User(**user_dict)

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.get("/users", response_model=List[User])
async def read_users(current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    users_list = []
    for user in users.find():
        # Properly convert ObjectId to string
        user["id"] = str(user.pop("_id"))
        if "hashed_password" in user:
            user.pop("hashed_password")
        users_list.append(User(**user))
    
    return users_list

# Protected route example
@app.get("/protected")
async def protected_route(current_user: User = Depends(get_current_active_user)):
    return {"message": "This is a protected route", "user": current_user.email}

# Role Management Endpoints
@app.get("/roles", response_model=List[Role])
async def get_roles(current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    roles_list = []
    for role in roles.find():
        # Properly convert ObjectId to string
        role["id"] = str(role.pop("_id"))
        roles_list.append(Role(**role))

    return roles_list

@app.get("/roles/{role_id}", response_model=Role)
async def get_role(role_id: str, current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    role = roles.find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    # Properly convert ObjectId to string
    role["id"] = str(role.pop("_id"))
    return Role(**role)

@app.post("/roles", response_model=Role)
async def create_role(role: RoleCreate, current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if roles.find_one({"name": role.name}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role already exists"
        )
    
    role_dict = role.model_dump()
    result = roles.insert_one(role_dict)
    print(type(result.inserted_id), type(result.inserted_id.__str__()))
    # Properly convert ObjectId to string
    role_dict["id"] = str(result.inserted_id)
    return Role(**role_dict)

@app.put("/roles/{role_id}", response_model=Role)
async def update_role(
    role_id: str,
    role_update: RoleUpdate,
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    role = roles.find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.get("is_system_role", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify system roles"
        )
    
    update_data = {k: v for k, v in role_update.model_dump(exclude_unset=True).items() if v is not None}
    if update_data:
        roles.update_one(
            {"_id": ObjectId(role_id)},
            {"$set": update_data}
        )
    
    updated_role = roles.find_one({"_id": ObjectId(role_id)})
    # Properly convert ObjectId to string
    updated_role["id"] = str(updated_role.pop("_id"))
    return Role(**updated_role)

@app.delete("/roles/{role_id}")
async def delete_role(role_id: str, current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    role = roles.find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.get("is_system_role", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system roles"
        )
    
    # Check if any users are using this role
    if users.find_one({"role": role["name"]}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete role while it's assigned to users"
        )
    
    roles.delete_one({"_id": ObjectId(role_id)})
    return {"message": "Role deleted successfully"}

@app.get("/resources")
async def get_resources(current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return [{"name": resource.value, "actions": [action.value for action in Action]} for resource in Resource] 