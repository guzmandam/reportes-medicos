from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from ....models.user import User, UserCreate, UserUpdate
from ....core.security import get_password_hash
from ....core.dependencies import get_current_active_user, get_admin_user
from ....core.database import users_collection
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=User)
async def create_user(user: UserCreate, _: dict = Depends(get_admin_user)):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    
    result = users_collection.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    return User(**user_dict)

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    return current_user

@router.get("/", response_model=List[User])
async def read_users(_: dict = Depends(get_admin_user)):
    users_list = []
    # TODO:Update this so the find already returns the values without the hashed_password
    for user in users_collection.find():
        user["id"] = str(user.pop("_id"))
        if "hashed_password" in user:
            user.pop("hashed_password")
        users_list.append(user)
    
    return users_list

@router.get("/{user_id}", response_model=User)
async def read_user(user_id: str, _: dict = Depends(get_admin_user)):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = str(user.pop("_id"))
    if "hashed_password" in user:
        user.pop("hashed_password")
    
    return user

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: UserUpdate, _: dict = Depends(get_admin_user)):
    # Check if user exists
    existing_user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare update data
    update_data = {}
    update_fields = user_update.model_dump(exclude_unset=True)
    
    # Check if email is being updated and if it's already in use
    if "email" in update_fields and update_fields["email"] != existing_user["email"]:
        if users_collection.find_one({"email": update_fields["email"]}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        update_data["email"] = update_fields["email"]
    
    # Handle password update
    if "password" in update_fields and update_fields["password"]:
        update_data["hashed_password"] = get_password_hash(update_fields["password"])
    
    # Add other fields
    for field in ["full_name", "role", "is_active"]:
        if field in update_fields:
            update_data[field] = update_fields[field]
    
    # Update user if there are changes
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
    
    # Return updated user
    updated_user = users_collection.find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    if "hashed_password" in updated_user:
        updated_user.pop("hashed_password")
    
    return updated_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, _: dict = Depends(get_admin_user)):
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return None 