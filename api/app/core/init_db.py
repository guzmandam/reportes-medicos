from .database import roles_collection, users_collection
from .security import get_password_hash
from ..models.role import Resource, Action
import logging

logger = logging.getLogger(__name__)

def init_roles():
    """Initialize default roles if they don't exist"""
    default_roles = {
        "admin": {
            "description": "Full system access and management capabilities",
            "permissions": {
                Resource.USERS.value: [action.value for action in Action],
                Resource.PATIENTS.value: [action.value for action in Action],
                Resource.MEDICAL_RECORDS.value: [action.value for action in Action],
                Resource.DOCUMENTS.value: [action.value for action in Action],
                Resource.APPOINTMENTS.value: [action.value for action in Action],
                Resource.ANALYTICS.value: [Action.READ.value, Action.MANAGE.value],
                Resource.SETTINGS.value: [Action.READ.value, Action.UPDATE.value, Action.MANAGE.value]
            },
            "is_system_role": True
        },
        "doctor": {
            "description": "Manage patients, medical records, and appointments",
            "permissions": {
                Resource.USERS.value: [],
                Resource.PATIENTS.value: [Action.CREATE.value, Action.READ.value, Action.UPDATE.value],
                Resource.MEDICAL_RECORDS.value: [Action.CREATE.value, Action.READ.value, Action.UPDATE.value],
                Resource.DOCUMENTS.value: [Action.CREATE.value, Action.READ.value, Action.UPDATE.value],
                Resource.APPOINTMENTS.value: [Action.CREATE.value, Action.READ.value, Action.UPDATE.value],
                Resource.ANALYTICS.value: [Action.READ.value],
                Resource.SETTINGS.value: [Action.READ.value]
            },
            "is_system_role": True
        },
        "user": {
            "description": "User role with limited access",
            "permissions": {
                Resource.USERS.value: [],
                Resource.PATIENTS.value: [Action.READ.value],
                Resource.MEDICAL_RECORDS.value: [Action.READ.value],
                Resource.DOCUMENTS.value: [Action.READ.value],
                Resource.APPOINTMENTS.value: [Action.READ.value],
                Resource.ANALYTICS.value: [],
                Resource.SETTINGS.value: []
            },
            "is_system_role": True
        }
    }

    # Initialize default roles
    for role_name, role_data in default_roles.items():
        if not roles_collection.find_one({"name": role_name}):
            roles_collection.insert_one({"name": role_name, **role_data})
            logger.info(f"Created default role: {role_name}")

def init_admin_user():
    """Create default admin user if no users exist"""
    if users_collection.count_documents({}) == 0:
        admin_user = {
            "email": "admin@example.com",
            "full_name": "System Administrator",
            "role": "admin",
            "hashed_password": get_password_hash("adminpassword"),
            "is_active": True
        }
        users_collection.insert_one(admin_user)
        logger.info("Created default admin user")

def init_db():
    """Initialize database with default data"""
    init_roles()
    init_admin_user() 