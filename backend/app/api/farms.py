from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .deps import get_current_user
from pydantic import BaseModel
from ..services.mqtt_service import get_mqtt_client
from ..core.config import settings
import json

router = APIRouter()

@router.get("", response_model=List[schemas.FarmResponse])
def retrieve_user_farms(db_conn: Session = Depends(get_db), active_person: models.User = Depends(get_current_user)):
    # Retrieve farms associated with the currently authenticated person
    return db_conn.query(models.Farm).filter(models.Farm.user_id == active_person.id).all()

@router.post("", response_model=schemas.FarmResponse)
def establish_new_farm(payload: schemas.FarmCreate, db_conn: Session = Depends(get_db), active_person: models.User = Depends(get_current_user)):
    fresh_entry = models.Farm(name=payload.name, location=payload.location, user_id=active_person.id)
    db_conn.add(fresh_entry)
    db_conn.commit()
    db_conn.refresh(fresh_entry)
    return fresh_entry

from ..database import sensor_collection

@router.get("/{farm_id}/telemetry")
async def obtain_live_telemetry_reading(farm_id: int, db_conn: Session = Depends(get_db), active_person: models.User = Depends(get_current_user)):
    # STRICT AUTHORIZATION: Ensure the farm belongs to the current valid user
    farm_record = db_conn.query(models.Farm).filter(models.Farm.id == farm_id).first()
    if not farm_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target agricultural entity could not be found.")
    
    if farm_record.user_id != active_person.id and active_person.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You lack sufficient permission credentials to pull telemetry for this entity.")

    latest_data_node = await sensor_collection.find_one({}, sort=[("timestamp", -1)])
    if not latest_data_node:
        return {"temperature": 28.5, "humidity": 55.0, "moisture": 38.0, "ph": 6.8}
    
    return {
        "temperature": latest_data_node.get("temperature", 28.5),
        "humidity": latest_data_node.get("humidity", 55.0),
        "moisture": latest_data_node.get("moisture", 38.0),
        "ph": latest_data_node.get("ph", 6.8)
    }

class ActuationRequest(BaseModel):
    command: str

@router.post("/{farm_id}/actuate")
async def actuate_farm_equipment(farm_id: int, payload: ActuationRequest, db_conn: Session = Depends(get_db), active_person: models.User = Depends(get_current_user)):
    farm_record = db_conn.query(models.Farm).filter(models.Farm.id == farm_id).first()
    if not farm_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target agricultural entity could not be found.")
    
    if farm_record.user_id != active_person.id and active_person.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You lack sufficient permission credentials.")

    client = get_mqtt_client()
    try:
        client.connect(settings.MQTT_BROKER_URL, settings.MQTT_PORT, 60)
        topic = f"farm/{farm_id}/control"
        msg = {"command": payload.command}
        client.publish(topic, json.dumps(msg))
        client.disconnect()
        return {"status": "success", "message": f"Command {payload.command} sent to farm {farm_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish to MQTT: {str(e)}")

