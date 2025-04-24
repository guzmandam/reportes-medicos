from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from typing import List, Optional
import os
import shutil
from datetime import datetime
from bson import ObjectId

from ....models.document import (
    Document, 
    DocumentCreate, 
    DocumentStatus, 
    DocumentType, 
    DocumentAnalysisResult, 
    DocumentExtractedData
)
from ....models.patient import (
    PatientCreate,
    Patient,
    Gender
)

from ....core.dependencies import get_current_active_user
from ....core.database import (
    documents_collection, 
    patients_collection, 
    vital_signs_collection, 
    dietetic_orders_collection, 
    prescriptions_collection,
    notes_collection
)
from ....core.config import get_settings
from ....utils.document_processor import (
    DocumentProcessor,
    StructuredData,
)

router = APIRouter()
settings = get_settings()

def format_date(date: Optional[str], hour: Optional[str]) -> datetime:
    if date and hour:
        return datetime.strptime(f"{date} {hour}", "%d/%m/%Y %H:%M")
    elif date:
        return datetime.strptime(date, "%d/%m/%Y")
    else:
        return None

async def create_patient(patient_data: dict):
    """Create a new patient"""
    gender_value = patient_data.get("Sexo", "").lower()
    gender = Gender.MALE
    if gender_value == "femenino" or gender_value == "f":
        gender = Gender.FEMALE
    elif gender_value != "masculino" and gender_value != "m":
        gender = Gender.OTHER
    
    patient_create = PatientCreate(
        names=patient_data.get("Nombres", ""),
        paternal_lastname=patient_data.get("ApellidoPaterno", ""),
        maternal_lastname=patient_data.get("ApellidoMaterno", ""),
        date_of_birth=patient_data.get("FechaNacimiento", ""),
        him=patient_data.get("HIM", None),
        gender=gender
    )
    
    patient = Patient(
        **patient_create.dict(), 
        created_at=datetime.utcnow(), 
        updated_at=datetime.utcnow(),
        doctors=[]
    )
    result = patients_collection.insert_one(patient.dict(exclude={"id"}))
    return str(result.inserted_id)

async def add_doctor_to_patient(patient_id: str, professional_certificate: str, sign_date: Optional[datetime]):
    """Add a doctor to a patient"""
    patients_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {"$push": {"doctors": {"professional_certificate": professional_certificate, "sign_date": sign_date}}}
    )

async def create_vital_signs(patient_id: str, note_id: str, vital_signs_data: dict):
    """Create vital signs for a patient"""
    inserted_vital_signs = {
        "patient_id": patient_id,
        "note_id": note_id,
        "data": vital_signs_data,
        "created_at": datetime.utcnow()
    }
    vital_signs_collection.insert_one(inserted_vital_signs)

async def create_prescriptions(patient_id: str, note_id: str, prescriptions_data: dict):
    """Create prescriptions for a patient"""
    inserted_prescriptions = {
        "patient_id": patient_id,
        "note_id": note_id,
        "data": prescriptions_data,
        "created_at": datetime.utcnow()
    }
    prescriptions_collection.insert_one(inserted_prescriptions)

async def create_dietetic_orders(patient_id: str, note_id: str, dietetic_orders_data: dict):
    """Create dietetic orders for a patient"""
    inserted_dietetic_orders = {
        "patient_id": patient_id,
        "note_id": note_id,
        "data": dietetic_orders_data,
        "created_at": datetime.utcnow()
    }
    dietetic_orders_collection.insert_one(inserted_dietetic_orders)

async def create_note(patient_id: str, note_data: dict):
    """Create a note for a patient"""
    inserted_note = {
        "patient_id": patient_id,
        "created_at": datetime.utcnow(),
        **note_data
    }
    notes_collection.insert_one(inserted_note)
    return str(inserted_note["_id"])

async def analyze_document_background(extracted_data: StructuredData):
    """Background task for document analysis"""
    patient_data = extracted_data.patient
    doctor_data = extracted_data.doctor
    note_data = extracted_data.note
    vital_signs_data = extracted_data.vital_signs
    dietetic_orders_data = extracted_data.dietetic_orders
    prescriptions_data = extracted_data.prescriptions

    patient_him = patient_data.get("HIM", None)

    if not (existing_patient := patients_collection.find_one({"him": patient_him})):    
        patient_id = await create_patient(patient_data)
    else:
        patient_id = str(existing_patient["_id"])

    # Create note
    note_id = await create_note(patient_id, note_data)

    # Add doctor to patient
    doctor_professional_certificate = doctor_data.get("CedulaProfesional", None)
    doctor_sign_date = doctor_data.get("FechaCreacion", None)
    doctor_sign_hour = doctor_data.get("HoraCreacion", None)

    doctor_sign_datetime = format_date(doctor_sign_date, doctor_sign_hour)

    await add_doctor_to_patient(patient_id, doctor_professional_certificate, doctor_sign_datetime)

    # Create vital signs
    vital_signs_data = vital_signs_data.get("Tabla", [])
    await create_vital_signs(patient_id, note_id, vital_signs_data)

    # Create dietetic orders
    dietetic_orders_data = dietetic_orders_data.get("Tabla", [])
    await create_dietetic_orders(patient_id, note_id, dietetic_orders_data)

    # Create prescriptions
    prescriptions_data = prescriptions_data.get("Tabla", [])
    await create_prescriptions(patient_id, note_id, prescriptions_data)

    return patient_id

@router.post("/test-upload-process")
async def test_document_processing(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Test endpoint to process a document and return structured data immediately
    without saving to database. Useful for testing the document processor.
    """
    # Create a temporary file to store the uploaded document
    upload_dir = os.path.join(os.getcwd(), "temp_uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Create a unique filename
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    try:
        # Save the uploaded file
        # Make sure to reset the file cursor position
        file.file.seek(0)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the document
        document_processor = DocumentProcessor(file_path)
        extracted_data = await document_processor.analyze()
        
        # Add as background task
        background_tasks.add_task(analyze_document_background, extracted_data)
        
        # Return the structured data
        return {
            "success": True,
            "message": "Document processed successfully and patient processing queued in background",
            "extracted_data": extracted_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )
    finally:
        # Clean up the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/upload", response_model=Document)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    document_type: DocumentType = Form(...),
    notes: Optional[str] = Form(None),
    patient_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_active_user)
):
    """Upload a new document (PDF) for processing"""
    
    # Check if patient exists if patient_id is provided
    if patient_id:
        patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
    
    # Ensure upload directory exists
    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Create a unique filename
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create document record
    document = {
        "title": title,
        "document_type": document_type.value,
        "notes": notes,
        "file_path": file_path,
        "uploaded_by": current_user["id"],
        "patient_id": patient_id,
        "status": DocumentStatus.PENDING.value,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert into database
    result = documents_collection.insert_one(document)
    document_id = str(result.inserted_id)
    
    # Process the document and extract data
    document_processor = DocumentProcessor(file_path)
    extracted_data = await document_processor.analyze()
    
    # Queue background processing with extracted data
    background_tasks.add_task(analyze_document_background, extracted_data)
    
    # Update status to processing
    documents_collection.update_one(
        {"_id": result.inserted_id},
        {"$set": {"status": DocumentStatus.PROCESSING.value}}
    )
    
    # Fetch the updated document
    doc = documents_collection.find_one({"_id": result.inserted_id})
    doc["id"] = str(doc.pop("_id"))
    
    return doc

@router.get("/", response_model=List[Document])
async def get_documents(
    status: Optional[DocumentStatus] = None,
    document_type: Optional[DocumentType] = None,
    patient_id: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a list of documents with optional filtering"""
    
    # Build query
    query = {}
    if status:
        query["status"] = status.value
    if document_type:
        query["document_type"] = document_type.value
    if patient_id:
        query["patient_id"] = patient_id
    
    # Add access control - regular users can only see their own documents
    if current_user.get("role") != "admin" and current_user.get("role") != "doctor":
        query["uploaded_by"] = current_user["id"]
    
    # Fetch documents
    documents_list = []
    for doc in documents_collection.find(query):
        doc["id"] = str(doc.pop("_id"))
        documents_list.append(doc)
    
    return documents_list

@router.get("/{document_id}", response_model=Document)
async def get_document(document_id: str, current_user: dict = Depends(get_current_active_user)):
    """Get a specific document by ID"""
    
    doc = documents_collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Access control - only admins, doctors, or the uploader can view the document
    if (current_user.get("role") != "admin" and 
        current_user.get("role") != "doctor" and 
        doc.get("uploaded_by") != current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this document"
        )
    
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.get("/{document_id}/analyze", response_model=DocumentAnalysisResult)
async def analyze_document(
    document_id: str, 
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_active_user)
):
    """Manually trigger document analysis"""
    
    doc = documents_collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Process the document
    file_path = doc.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document file not found"
        )
    
    # Process the document and extract data
    document_processor = DocumentProcessor(file_path)
    extracted_data = await document_processor.analyze()
    
    # Queue background processing with extracted data
    background_tasks.add_task(analyze_document_background, extracted_data)
    
    # Update status to processing
    documents_collection.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {"status": DocumentStatus.PROCESSING.value}}
    )
    
    return {
        "document_id": document_id,
        "success": True,
        "extracted_data": extracted_data,
        "error_message": None
    }

@router.get("/{document_id}/extracted-data", response_model=DocumentExtractedData)
async def get_extracted_data(document_id: str, current_user: dict = Depends(get_current_active_user)):
    """Get the extracted data from an analyzed document"""
    
    doc = documents_collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc.get("status") != DocumentStatus.ANALYZED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has not been analyzed yet"
        )
    
    # Access control
    if (current_user.get("role") != "admin" and 
        current_user.get("role") != "doctor" and 
        doc.get("uploaded_by") != current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this document"
        )
    
    return doc.get("extracted_data", {}) 