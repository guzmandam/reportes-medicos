from pymongo import MongoClient
from .config import get_settings
from .models import Resource, Action

settings = get_settings()
client = MongoClient(settings.mongodb_url)
db = client[settings.mongodb_name]

# Collections
users = db.users
roles = db.roles

# Initialize default roles if they don't exist
default_roles = {
    "admin": {
        "description": "Full system access and management capabilities",
        "permissions": {
            Resource.USERS: [action.value for action in Action],
            Resource.PATIENTS: [action.value for action in Action],
            Resource.MEDICAL_RECORDS: [action.value for action in Action],
            Resource.APPOINTMENTS: [action.value for action in Action],
            Resource.ANALYTICS: [Action.READ.value, Action.MANAGE.value],
            Resource.SETTINGS: [Action.READ.value, Action.UPDATE.value, Action.MANAGE.value]
        },
        "is_system_role": True
    },
    "doctor": {
        "description": "Manage patients, medical records, and appointments",
        "permissions": {
            Resource.USERS: [],
            Resource.PATIENTS: [Action.CREATE.value, Action.READ.value, Action.UPDATE.value],
            Resource.MEDICAL_RECORDS: [Action.CREATE.value, Action.READ.value, Action.UPDATE.value],
            Resource.APPOINTMENTS: [Action.CREATE.value, Action.READ.value, Action.UPDATE.value],
            Resource.ANALYTICS: [Action.READ.value],
            Resource.SETTINGS: [Action.READ.value]
        },
        "is_system_role": True
    },
    "user": {
        "description": "User role with limited access",
        "permissions": {
            Resource.USERS: [Action.READ.value],
            Resource.PATIENTS: [Action.READ.value],
            Resource.MEDICAL_RECORDS: [Action.READ.value],
            Resource.APPOINTMENTS: [Action.READ.value],
            Resource.ANALYTICS: [Action.READ.value],
            Resource.SETTINGS: [Action.READ.value]
        },
        "is_system_role": True
    }
}

# Initialize default roles
for role_name, role_data in default_roles.items():
    if not roles.find_one({"name": role_name}):
        roles.insert_one({"name": role_name, **role_data}) 