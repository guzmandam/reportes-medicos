from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

class Resource(str, Enum):
    USERS = "users"
    PATIENTS = "patients"
    MEDICAL_RECORDS = "medical_records"
    APPOINTMENTS = "appointments"
    ANALYTICS = "analytics"
    SETTINGS = "settings"
    DOCUMENTS = "documents"

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
    is_system_role: bool = False

class RoleCreate(BaseModel):
    name: str
    description: str
    permissions: Dict[Resource, List[Action]]

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[Dict[Resource, List[Action]]] = None 