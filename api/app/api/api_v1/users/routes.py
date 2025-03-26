from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ....models.user import User, UserCreate
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

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, _: dict = Depends(get_admin_user)):
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return None 