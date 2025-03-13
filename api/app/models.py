from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class User(UserBase):
    id: Optional[str] = Field(None, alias="id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Resource(str, Enum):
    USERS = "users"
    PATIENTS = "patients"
    MEDICAL_RECORDS = "medical_records"
    APPOINTMENTS = "appointments"
    ANALYTICS = "analytics"
    SETTINGS = "settings"

class Action(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    MANAGE = "manage"

class Permission(BaseModel):
    resource: Resource
    actions: List[Action]

class Role(BaseModel):
    id: Optional[str] = Field(None)
    name: str
    description: str
    permissions: Dict[Resource, List[Action]]
    is_system_role: bool = False  # To identify default system roles that cannot be deleted

class RoleCreate(BaseModel):
    name: str
    description: str
    permissions: Dict[Resource, List[Action]]

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[Dict[Resource, List[Action]]] = None 