from enum import Enum
from typing import Dict, List, Set

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
    MANAGE = "manage"  # Special permission for administrative actions

class Permission:
    def __init__(self, resource: Resource, actions: List[Action]):
        self.resource = resource
        self.actions = set(actions)

    def has_action(self, action: Action) -> bool:
        return action in self.actions

# Define role-based permissions
ROLE_PERMISSIONS: Dict[str, Dict[Resource, Set[Action]]] = {
    "admin": {
        # Admins have full access to everything
        Resource.USERS: {Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE},
        Resource.PATIENTS: {Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE},
        Resource.MEDICAL_RECORDS: {Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE},
        Resource.APPOINTMENTS: {Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MANAGE},
        Resource.ANALYTICS: {Action.READ, Action.MANAGE},
        Resource.SETTINGS: {Action.READ, Action.UPDATE, Action.MANAGE},
    },
    "doctor": {
        # Doctors can manage patients and medical records
        Resource.PATIENTS: {Action.CREATE, Action.READ, Action.UPDATE},
        Resource.MEDICAL_RECORDS: {Action.CREATE, Action.READ, Action.UPDATE},
        Resource.APPOINTMENTS: {Action.CREATE, Action.READ, Action.UPDATE},
        Resource.ANALYTICS: {Action.READ},
        Resource.SETTINGS: {Action.READ},
    },
    "nurse": {
        # Nurses have limited access to patient data and can create records
        Resource.PATIENTS: {Action.READ, Action.UPDATE},
        Resource.MEDICAL_RECORDS: {Action.CREATE, Action.READ},
        Resource.APPOINTMENTS: {Action.READ, Action.UPDATE},
    },
    "receptionist": {
        # Receptionists manage appointments and basic patient info
        Resource.PATIENTS: {Action.CREATE, Action.READ},
        Resource.APPOINTMENTS: {Action.CREATE, Action.READ, Action.UPDATE},
    },
    "user": {
        # Basic user role with minimal permissions
        Resource.PATIENTS: {Action.READ},
        Resource.MEDICAL_RECORDS: {Action.READ},
        Resource.APPOINTMENTS: {Action.READ},
    }
}

def has_permission(role: str, resource: Resource, action: Action) -> bool:
    """
    Check if a role has permission to perform an action on a resource.
    """
    if role not in ROLE_PERMISSIONS:
        return False
    
    if resource not in ROLE_PERMISSIONS[role]:
        return False
    
    return action in ROLE_PERMISSIONS[role][resource]

def get_role_permissions(role: str) -> Dict[Resource, Set[Action]]:
    """
    Get all permissions for a specific role.
    """
    return ROLE_PERMISSIONS.get(role, {}) 