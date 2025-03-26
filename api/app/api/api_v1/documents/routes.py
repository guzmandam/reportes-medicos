from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from typing import List, Optional
import os
import shutil
from datetime import datetime
from bson import ObjectId

from ....models.document import Document, DocumentCreate, DocumentStatus, DocumentType, DocumentAnalysisResult, DocumentExtractedData
from ....core.dependencies import get_current_active_user
from ....core.database import documents_collection, patients_collection
from ....core.config import get_settings
from ....utils.document_processor import process_document

router = APIRouter()
settings = get_settings()

# Mock function for document analysis - this would be replaced with actual OCR/ML logic
async def analyze_document_background(document_id: str):
    """Background task for document analysis"""
    # Get the document from database
    doc = documents_collection.find_one({"_id": ObjectId(document_id)})
    if not doc:
        # Document not found
        return
    
    try:
        # Process document using our utility function
        file_path = doc.get("file_path")
        extracted_data = await process_document(file_path)
        
        # Update document with extracted data
        documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {
                "$set": {
                    "status": DocumentStatus.ANALYZED.value,
                    "analyzed_at": datetime.utcnow(),
                    "extracted_data": extracted_data
                }
            }
        )
    except Exception as e:
        # Update document status to failed if an error occurs
        documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {
                "$set": {
                    "status": DocumentStatus.FAILED.value,
                    "error_message": str(e)
                }
            }
        )

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
    
    # Queue background processing
    background_tasks.add_task(analyze_document_background, document_id)
    
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
    
    # Queue background processing
    background_tasks.add_task(analyze_document_background, document_id)
    
    # Update status to processing
    documents_collection.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {"status": DocumentStatus.PROCESSING.value}}
    )
    
    return {
        "document_id": document_id,
        "success": True,
        "extracted_data": {},
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