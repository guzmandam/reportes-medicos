from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from ....models.patient import Patient, PatientCreate, PatientUpdate, Gender
from ....models.document import DocumentExtractedData, PatientInfo
from ....core.dependencies import get_current_active_user
from ....core.database import patients_collection, documents_collection

router = APIRouter()

@router.post("/", response_model=Patient)
async def create_patient(
    patient: PatientCreate,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new patient"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    patient_dict = patient.model_dump()
    patient_dict["created_at"] = datetime.utcnow()
    patient_dict["updated_at"] = datetime.utcnow()
    patient_dict["created_by"] = current_user["id"]
    
    result = patients_collection.insert_one(patient_dict)
    patient_dict["id"] = str(result.inserted_id)
    
    return patient_dict

@router.get("/", response_model=List[Patient])
async def get_patients(
    current_user: dict = Depends(get_current_active_user)
):
    """Get a list of patients"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    patients_list = []
    for patient in patients_collection.find():
        patient["id"] = str(patient.pop("_id"))
        patients_list.append(patient)
    
    return patients_list

@router.get("/{patient_id}", response_model=Patient)
async def get_patient(
    patient_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific patient by ID"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient["id"] = str(patient.pop("_id"))
    return patient

@router.put("/{patient_id}", response_model=Patient)
async def update_patient(
    patient_id: str,
    patient_update: PatientUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update a patient's information"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = {k: v for k, v in patient_update.model_dump(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    if update_data:
        patients_collection.update_one(
            {"_id": ObjectId(patient_id)},
            {"$set": update_data}
        )
    
    updated_patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    updated_patient["id"] = str(updated_patient.pop("_id"))
    
    return updated_patient

@router.post("/from-document/{document_id}", response_model=Patient)
async def create_patient_from_document(
    document_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Create a patient from document extracted data"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get the document
    doc = documents_collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if document has been analyzed
    if doc.get("status") != "analyzed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has not been analyzed yet"
        )
    
    # Get extracted patient info
    extracted_data = doc.get("extracted_data", {})
    patient_info = extracted_data.get("patient_info")
    
    if not patient_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No patient information found in document"
        )
    
    # Create patient data
    try:
        # Convert string date to datetime if possible
        if isinstance(patient_info.get("date_of_birth"), str):
            from dateutil import parser
            dob = parser.parse(patient_info["date_of_birth"])
        else:
            dob = datetime.utcnow()  # Fallback
        
        patient_data = {
            "full_name": patient_info["full_name"],
            "date_of_birth": dob,
            "gender": patient_info.get("gender", "other"),
            "id_number": patient_info.get("id_number"),
            "address": patient_info.get("address"),
            "phone": patient_info.get("phone"),
            "email": patient_info.get("email"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": current_user["id"],
            # Additional data from document
            "medical_history": extracted_data.get("diagnosis", []),
            "medications": extracted_data.get("medications", [])
        }
        
        # Insert patient
        result = patients_collection.insert_one(patient_data)
        patient_id = str(result.inserted_id)
        
        # Link document to patient
        documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"patient_id": patient_id}}
        )
        
        # Return patient
        patient_data["id"] = patient_id
        return patient_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating patient from document: {str(e)}"
        )