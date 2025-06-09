from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class DietticOrderBase(BaseModel):
    patient_id: str
    note_id: Optional[str] = None
    order_type: Optional[str] = None
    description: Optional[str] = None
    restrictions: Optional[str] = None
    doctor_certificate: Optional[str] = None
    document_id: Optional[str] = None

class DietticOrderCreate(DietticOrderBase):
    pass

class DietticOrderUpdate(BaseModel):
    order_type: Optional[str] = None
    description: Optional[str] = None
    restrictions: Optional[str] = None
    doctor_certificate: Optional[str] = None

class DietticOrder(DietticOrderBase):
    id: Optional[str] = Field(None, alias="id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    data: Optional[Dict[str, Any]] = None  # Raw extracted data 