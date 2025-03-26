from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ....models.role import Role, RoleCreate, RoleUpdate, Resource, Action
from ....core.dependencies import get_admin_user
from ....core.database import roles_collection, users_collection
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[Role])
async def get_roles(_: dict = Depends(get_admin_user)):
    roles_list = []
    for role in roles_collection.find():
        role["id"] = str(role.pop("_id"))
        roles_list.append(role)
    
    return roles_list

@router.get("/{role_id}", response_model=Role)
async def get_role(role_id: str, _: dict = Depends(get_admin_user)):
    role = roles_collection.find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    role["id"] = str(role.pop("_id"))
    return role

@router.post("/", response_model=Role)
async def create_role(role: RoleCreate, _: dict = Depends(get_admin_user)):
    if roles_collection.find_one({"name": role.name}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role already exists"
        )
    
    role_dict = role.model_dump()
    result = roles_collection.insert_one(role_dict)
    role_dict["id"] = str(result.inserted_id)
    
    return role_dict

@router.put("/{role_id}", response_model=Role)
async def update_role(
    role_id: str,
    role_update: RoleUpdate,
    _: dict = Depends(get_admin_user)
):
    role = roles_collection.find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.get("is_system_role", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify system roles"
        )
    
    update_data = {k: v for k, v in role_update.model_dump(exclude_unset=True).items() if v is not None}
    if update_data:
        roles_collection.update_one(
            {"_id": ObjectId(role_id)},
            {"$set": update_data}
        )
    
    updated_role = roles_collection.find_one({"_id": ObjectId(role_id)})
    updated_role["id"] = str(updated_role.pop("_id"))
    
    return updated_role

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(role_id: str, _: dict = Depends(get_admin_user)):
    role = roles_collection.find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.get("is_system_role", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system roles"
        )
    
    # Check if any users are using this role
    if users_collection.find_one({"role": role["name"]}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete role while it's assigned to users"
        )
    
    roles_collection.delete_one({"_id": ObjectId(role_id)})
    return None

@router.get("/resources/list")
async def get_resources(_: dict = Depends(get_admin_user)):
    return [{"name": resource.value, "actions": [action.value for action in Action]} for resource in Resource] 