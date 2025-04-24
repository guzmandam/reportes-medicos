from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    MEDICAL_RECORD = "medical_record"
    LAB_RESULT = "lab_result"
    PRESCRIPTION = "prescription"
    DISCHARGE_SUMMARY = "discharge_summary"
    REFERRAL = "referral"
    OTHER = "other"

class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    FAILED = "failed"

class DocumentBase(BaseModel):
    note_number: str
    note_type: str #DocumentType
    record_number: Optional[str] = None
    him: Optional[str] = None
    hospital: Optional[str] = None
    admission_date: Optional[str] = None
    admission_time: Optional[str] = None
    discharge_time: Optional[str] = None

class DocumentCreate(DocumentBase):
    patient_id: Optional[str] = None  # Can be linked to a patient later

class DocumentInDB(DocumentBase):
    id: Optional[str] = Field(None, alias="id")
    file_path: str
    uploaded_by: str  # User ID who uploaded the document
    patient_id: Optional[str] = None
    status: DocumentStatus = DocumentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None
    extracted_data: Optional[Dict[str, Any]] = None
    
class Document(DocumentInDB):
    pass

class DocumentAnalysisResult(BaseModel):
    document_id: str
    success: bool
    extracted_data: Dict[str, Any]
    error_message: Optional[str] = None

class PatientInfo(BaseModel):
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    id_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    
class DocumentExtractedData(BaseModel):
    patient_info: Optional[PatientInfo] = None
    document_date: Optional[str] = None
    medical_facility: Optional[str] = None
    doctor_name: Optional[str] = None
    diagnosis: Optional[List[str]] = None
    treatments: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    additional_notes: Optional[str] = None
    raw_text: Optional[str] = None 