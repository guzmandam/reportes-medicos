from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class PrescriptionBase(BaseModel):
    patient_id: str
    note_id: Optional[str] = None
    medication_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    doctor_certificate: Optional[str] = None
    document_id: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(BaseModel):
    medication_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    doctor_certificate: Optional[str] = None

class Prescription(PrescriptionBase):
    id: Optional[str] = Field(None, alias="id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # updated_at: datetime = Field(default_factory=datetime.utcnow)
    data: Optional[List[Dict[str, Any]]] = None  # Raw extracted data 