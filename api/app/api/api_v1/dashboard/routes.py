from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from bson import ObjectId
from ....core.database import (
    users_collection, 
    patients_collection, 
    documents_collection,
    vital_signs_collection,
    dietetic_orders_collection,
    prescriptions_collection,
    notes_collection
)
from ....core.dependencies import get_current_active_user
from ....models.user import User

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_active_user)):
    """
    Get dashboard statistics including:
    - Total patients
    - Processed files
    - Pending uploads
    - Active users
    - Weekly activity
    - Recent uploads
    """
    try:
        # Get current date for time-based queries
        now = datetime.utcnow()
        one_month_ago = now - timedelta(days=30)
        one_week_ago = now - timedelta(days=7)
        
        # Count totals
        total_patients = patients_collection.count_documents({})
        total_files = documents_collection.count_documents({})
        pending_uploads = documents_collection.count_documents({"status": "pending"})
        
        # Active users (users who have been active in the last month)
        # For now, we'll count all active users since we don't have last_login tracking
        active_users = users_collection.count_documents({"is_active": True})
        
        # Previous month counts for comparison
        prev_month_start = one_month_ago - timedelta(days=30)
        prev_month_patients = patients_collection.count_documents({
            "created_at": {"$gte": prev_month_start, "$lt": one_month_ago}
        })
        prev_month_files = documents_collection.count_documents({
            "created_at": {"$gte": prev_month_start, "$lt": one_month_ago}
        })
        prev_month_pending = documents_collection.count_documents({
            "status": "pending",
            "created_at": {"$gte": prev_month_start, "$lt": one_month_ago}
        })
        
        # Calculate percentage changes
        patient_change = calculate_percentage_change(
            patients_collection.count_documents({"created_at": {"$gte": one_month_ago}}),
            prev_month_patients
        )
        files_change = calculate_percentage_change(
            documents_collection.count_documents({"created_at": {"$gte": one_month_ago}}),
            prev_month_files
        )
        pending_change = calculate_percentage_change(
            documents_collection.count_documents({
                "status": "pending",
                "created_at": {"$gte": one_month_ago}
            }),
            prev_month_pending
        )
        
        # Weekly activity data
        weekly_activity = get_weekly_activity()
        
        # Recent uploads (last 10)
        recent_uploads = get_recent_uploads()
        
        return {
            "total_patients": total_patients,
            "total_files": total_files,
            "pending_uploads": pending_uploads,
            "active_users": active_users,
            "changes": {
                "patients": patient_change,
                "files": files_change,
                "pending": pending_change,
                "users": 0  # We'll implement user activity tracking later
            },
            "weekly_activity": weekly_activity,
            "recent_uploads": recent_uploads
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard stats: {str(e)}")

def calculate_percentage_change(current: int, previous: int) -> int:
    """Calculate percentage change between two values"""
    if previous == 0:
        return 100 if current > 0 else 0
    return int(((current - previous) / previous) * 100)

def get_weekly_activity() -> List[Dict]:
    """Get weekly activity data for the last 7 days"""
    weekly_data = []
    now = datetime.utcnow()
    
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for i in range(7):
        day_start = now - timedelta(days=6-i)
        day_end = day_start + timedelta(days=1)
        
        # Count uploads for this day
        uploads = documents_collection.count_documents({
            "created_at": {"$gte": day_start, "$lt": day_end}
        })
        
        # Count processed files for this day
        processed = documents_collection.count_documents({
            "status": "analyzed",
            "analyzed_at": {"$gte": day_start, "$lt": day_end}
        })
        
        weekly_data.append({
            "name": days[i],
            "uploads": uploads,
            "processed": processed
        })
    
    return weekly_data

def get_recent_uploads() -> List[Dict]:
    """Get recent uploads with user information"""
    try:
        # Get last 10 documents
        recent_docs = list(documents_collection.find(
            {},
            {"_id": 1, "note_number": 1, "uploaded_by": 1, "status": 1, "created_at": 1, "file_path": 1}
        ).sort("created_at", -1).limit(10))
        
        uploads = []
        for doc in recent_docs:
            # Get user info
            user = users_collection.find_one({"_id": ObjectId(doc["uploaded_by"])})
            
            # Calculate time ago
            time_ago = calculate_time_ago(doc["created_at"])
            
            # Get filename from file_path
            filename = doc.get("file_path", "").split("/")[-1] if doc.get("file_path") else f"document_{doc['note_number']}.pdf"
            
            uploads.append({
                "id": str(doc["_id"]),
                "filename": filename,
                "uploadedBy": user.get("full_name", "Unknown User") if user else "Unknown User",
                "status": doc["status"].title(),
                "time": time_ago,
                "avatar": "/placeholder.svg?height=32&width=32",
                "initials": get_initials(user.get("full_name", "UU") if user else "UU")
            })
        
        return uploads
        
    except Exception as e:
        # Return empty list if there's an error
        return []

def calculate_time_ago(date: datetime) -> str:
    """Calculate human-readable time ago"""
    now = datetime.utcnow()
    diff = now - date
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

def get_initials(full_name: str) -> str:
    """Get initials from full name"""
    if not full_name:
        return "UU"
    
    words = full_name.split()
    if len(words) >= 2:
        return f"{words[0][0]}{words[1][0]}".upper()
    elif len(words) == 1:
        return words[0][:2].upper()
    else:
        return "UU" 