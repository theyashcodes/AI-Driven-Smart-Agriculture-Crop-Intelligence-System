from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.FarmResponse])
def get_farms(db: Session = Depends(get_db)):
    return db.query(models.Farm).all()

@router.post("/", response_model=schemas.FarmResponse)
def create_farm(farm: schemas.FarmCreate, db: Session = Depends(get_db)):
    # Assuming user_id=1 for now, until we add current_user dependency
    new_farm = models.Farm(name=farm.name, location=farm.location, user_id=1)
    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)
    return new_farm
