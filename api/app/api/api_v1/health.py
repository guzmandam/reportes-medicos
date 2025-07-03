from fastapi import APIRouter, Depends, HTTPException
from ...core.database import get_database
from pymongo.database import Database
import time

router = APIRouter()

@router.get("/health")
async def health_check(db: Database = Depends(get_database)):
    """
    Health check endpoint for monitoring and load balancers
    """
    start_time = time.time()
    
    try:
        # Check database connectivity
        db.admin.command('ping')
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
        raise HTTPException(status_code=503, detail="Database unhealthy")
    
    response_time = time.time() - start_time
    
    return {
        "status": "healthy",
        "timestamp": int(time.time()),
        "version": "1.0.0",
        "database": db_status,
        "response_time_ms": round(response_time * 1000, 2)
    } 