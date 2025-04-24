from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class Gender(str, Enum):
    MALE = "Masculino"
    FEMALE = "Femenino"
    OTHER = "Otro"

class PatientBase(BaseModel):
    names: str
    paternal_lastname: str
    maternal_lastname: str
    date_of_birth: str
    him: str # Hospital Identification Number (ID)
    gender: Gender
    #gender: Gender
    #id_number: Optional[str] = None
    #address: Optional[str] = None
    #phone: Optional[str] = None
    #email: Optional[EmailStr] = None
    #emergency_contact: Optional[str] = None
    
class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: Optional[str] = Field(None, alias="id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    doctors: Optional[List[str]] = None # Professional Certificate Number of each doctor that has attended the patient

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    id_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    emergency_contact: Optional[str] = None
    medical_history: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    medications: Optional[List[str]] = None 