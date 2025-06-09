from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class VitalSignsBase(BaseModel):
    patient_id: str
    note_id: Optional[str] = None
    # measurements: Optional[Dict[str, Any]] = None
    # measured_by: Optional[str] = None
    # doctor_certificate: Optional[str] = None
    # document_id: Optional[str] = None

class VitalSignsCreate(VitalSignsBase):
    pass

class VitalSignsUpdate(BaseModel):
    measurements: Optional[Dict[str, Any]] = None
    measured_by: Optional[str] = None
    doctor_certificate: Optional[str] = None

class VitalSigns(VitalSignsBase):
    id: Optional[str] = Field(None, alias="id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # updated_at: datetime = Field(default_factory=datetime.utcnow)
    data: Optional[List[Dict[str, Any]]] = None  # Raw extracted data 