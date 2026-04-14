from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.FarmResponse])
def get_farms(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()

@router.post("/", response_model=schemas.FarmResponse)
def create_farm(farm: schemas.FarmCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_farm = models.Farm(name=farm.name, location=farm.location, user_id=current_user.id)
    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)
    return new_farm

from ..database import sensor_collection

@router.get("/{farm_id}/telemetry")
async def get_farm_telemetry(farm_id: int, current_user: models.User = Depends(get_current_user)):
    doc = await sensor_collection.find_one({}, sort=[("timestamp", -1)])
    if not doc:
        return {"temperature": 28.5, "humidity": 55.0, "moisture": 38.0, "ph": 6.8}
    
    return {
        "temperature": doc.get("temperature", 28.5),
        "humidity": doc.get("humidity", 55.0),
        "moisture": doc.get("moisture", 38.0),
        "ph": doc.get("ph", 6.8)
    }

