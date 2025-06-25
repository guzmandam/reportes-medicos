from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from ....models.patient import Patient, PatientCreate, PatientUpdate, Gender
from ....models.document import DocumentExtractedData, PatientInfo, Document
from ....models.medical_note import MedicalNote
from ....models.prescription import Prescription
from ....models.vital_signs import VitalSigns
from ....models.dietetic_order import DietticOrder
from ....core.dependencies import get_current_active_user
from ....core.database import (
    patients_collection, 
    documents_collection,
    notes_collection,
    prescriptions_collection,
    vital_signs_collection,
    dietetic_orders_collection
)

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

@router.get("/{patient_id}/notes", response_model=List[MedicalNote])
async def get_patient_notes(
    patient_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get all medical notes for a specific patient"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if patient exists
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    notes_list = []
    for note in notes_collection.find({"patient_id": patient_id}).sort("created_at", -1):
        note["id"] = str(note.pop("_id"))
        notes_list.append(note)
    
    return notes_list

@router.get("/{patient_id}/prescriptions", response_model=List[Prescription])
async def get_patient_prescriptions(
    patient_id: str,
    medication_name: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
):
    """Get all prescriptions for a specific patient with optional filters"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if patient exists
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Build the MongoDB query
    query = {"patient_id": patient_id}
    
    # Add date filter if provided
    if start_date or end_date:
        date_filter = {}
        if start_date:
            try:
                start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                date_filter["$gte"] = start_datetime
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        if end_date:
            try:
                end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                date_filter["$lte"] = end_datetime
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        query["created_at"] = date_filter
    
    # Execute the query
    prescriptions_cursor = prescriptions_collection.find(query).sort("created_at", -1)
    
    prescriptions_list = []
    for prescription in prescriptions_cursor:
        prescription["id"] = str(prescription.pop("_id"))
        
        # Filter by medication name if provided
        if medication_name:
            medication_found = False
            if prescription.get("data") and isinstance(prescription["data"], list):
                for med in prescription["data"]:
                    med_name = med.get("Medicamento", "").lower()
                    if medication_name.lower() in med_name:
                        medication_found = True
                        break
            if not medication_found:
                continue
        
        prescriptions_list.append(prescription)
    
    return prescriptions_list

@router.get("/{patient_id}/vital-signs", response_model=List[VitalSigns])
async def get_patient_vital_signs(
    patient_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get all vital signs for a specific patient"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if patient exists
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    vital_signs_list = []
    for vital_signs in vital_signs_collection.find({"patient_id": patient_id}).sort("created_at", -1):
        if vital_signs.get("data") and len(vital_signs.get("data", [])) > 0:
            vital_signs["id"] = str(vital_signs.pop("_id"))
            vital_signs_list.append(vital_signs)
    
    return vital_signs_list

@router.get("/{patient_id}/dietetic-orders", response_model=List[DietticOrder])
async def get_patient_dietetic_orders(
    patient_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get all dietetic orders for a specific patient"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if patient exists
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    dietetic_orders_list = []
    for order in dietetic_orders_collection.find({"patient_id": patient_id}).sort("created_at", -1):
        order["id"] = str(order.pop("_id"))
        dietetic_orders_list.append(order)
    
    return dietetic_orders_list

@router.get("/{patient_id}/documents", response_model=List[Document])
async def get_patient_documents(
    patient_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get all documents for a specific patient"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if patient exists
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    documents_list = []
    for doc in documents_collection.find({"patient_id": patient_id}).sort("created_at", -1):
        doc["id"] = str(doc.pop("_id"))
        documents_list.append(doc)
    
    return documents_list

@router.get("/{patient_id}/doctors")
async def get_patient_doctors(
    patient_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get all doctors associated with a specific patient"""
    # Check if current user has permission
    if current_user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if patient exists
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    doctors = patient.get("doctors", [])
    
    # Get unique doctor certificates and their details
    unique_doctors = {}
    for doctor in doctors:
        cert = doctor.get("professional_certificate")
        if cert and cert not in unique_doctors:
            unique_doctors[cert] = {
                "professional_certificate": cert,
                "sign_date": doctor.get("sign_date"),
                "total_interactions": 1
            }
        elif cert:
            unique_doctors[cert]["total_interactions"] += 1
    
    return list(unique_doctors.values())