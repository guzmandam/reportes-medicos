from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class MedicalNoteBase(BaseModel):
    patient_id: str
    note_type: Optional[str] = Field(None, alias="TipoNota", description="Tipo de nota")
    note_number: Optional[str] = Field(None, alias="NoNota", description="Número de nota")
    expedient_number: Optional[str] = Field(None, alias="NoExpediente", description="Número de expediente")
    him: Optional[str] = Field(None, alias="HIM", description="HIM")
    admission_date: Optional[str] = Field(None, alias="FechaIngreso", description="Fecha de ingreso")
    admission_time: Optional[str] = Field(None, alias="HoraIngreso", description="Hora de ingreso")
    discharge_time: Optional[str] = Field(None, alias="HoraAlta", description="Hora de alta")

class MedicalNoteCreate(MedicalNoteBase):
    pass

class MedicalNoteUpdate(BaseModel):
    note_type: Optional[str] = None
    content: Optional[str] = None
    diagnosis: Optional[List[str]] = None
    treatment: Optional[str] = None
    doctor_certificate: Optional[str] = None

class MedicalNote(MedicalNoteBase):
    id: Optional[str] = Field(None, alias="id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # updated_at: datetime = Field(default_factory=datetime.utcnow)