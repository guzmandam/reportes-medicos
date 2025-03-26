from pymongo import MongoClient
from .config import get_settings

settings = get_settings()
client = MongoClient(settings.mongodb_url)
db = client[settings.mongodb_name]

# Common collections - will be used across multiple modules
users_collection = db.users # ✅
roles_collection = db.roles # ✅
patients_collection = db.patients # 🔴
medical_records_collection = db.medical_records # 🔴
documents_collection = db.documents # 🔴