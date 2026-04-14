from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import time
from .deps import get_current_user, get_current_admin
from .. import models

router = APIRouter()

# Mock Database for User Settings
user_settings_db = {
    1: {"phone": "", "sms_enabled": False}
}

class AlertSettingsUpdate(BaseModel):
    phone: str
    sms_enabled: bool

class SMSRequest(BaseModel):
    message: str
    phone: str

@router.post("/settings")
def update_notification_settings(settings: AlertSettingsUpdate, current_user: models.User = Depends(get_current_user)):
    user_settings_db[current_user.id] = {
        "phone": settings.phone,
        "sms_enabled": settings.sms_enabled
    }
    return {"status": "success", "settings": user_settings_db[current_user.id]}

@router.get("/settings")
def get_notification_settings(current_user: models.User = Depends(get_current_user)):
    return user_settings_db.get(current_user.id, {"phone": "", "sms_enabled": False})

@router.delete("/settings")
def delete_notification_settings(current_user: models.User = Depends(get_current_admin)):
    # Example of authorization: only admins can delete global settings
    if current_user.id in user_settings_db:
        del user_settings_db[current_user.id]
    return {"status": "success", "detail": "Settings deleted by admin"}

@router.post("/send-sms")
def test_send_sms(req: SMSRequest):
    settings = user_settings_db.get(1, {})
    if not req.phone:
        return {"status": "error", "detail": "No phone number provided."}
    
    # Simulate external API call to Twilio/AWS SNS
    time.sleep(1)
    
    print("\n" + "="*50)
    print(f"📠 [TWILIO API SIMULATOR]")
    print(f"📤 SENDING SMS TO: {req.phone}")
    print(f"✉️  MESSAGE: {req.message}")
    print("="*50 + "\n")
    
    return {"status": "success", "detail": f"Simulated SMS sent successfully to {req.phone}."}
