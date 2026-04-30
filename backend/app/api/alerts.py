from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import time
import httpx
from .deps import get_current_user, get_current_admin
from .. import models
from ..core.config import settings

router = APIRouter()

# Mock Database for User Settings
user_settings_db = {
    1: {"chat_id": "8290090855", "telegram_enabled": True}
}

class AlertSettingsUpdate(BaseModel):
    chat_id: str
    telegram_enabled: bool

class TelegramRequest(BaseModel):
    message: str
    chat_id: str

@router.post("/settings")
def update_notification_settings(settings_req: AlertSettingsUpdate, current_user: models.User = Depends(get_current_user)):
    user_settings_db[current_user.id] = {
        "chat_id": settings_req.chat_id,
        "telegram_enabled": settings_req.telegram_enabled
    }
    return {"status": "success", "settings": user_settings_db[current_user.id]}

@router.get("/settings")
def get_notification_settings(current_user: models.User = Depends(get_current_user)):
    return user_settings_db.get(current_user.id, {"chat_id": "", "telegram_enabled": False})

@router.delete("/settings")
def delete_notification_settings(current_user: models.User = Depends(get_current_admin)):
    # Example of authorization: only admins can delete global settings
    if current_user.id in user_settings_db:
        del user_settings_db[current_user.id]
    return {"status": "success", "detail": "Settings deleted by admin"}

@router.post("/send-telegram")
async def test_send_telegram(req: TelegramRequest):
    if not req.chat_id:
        return {"status": "error", "detail": "No Chat ID provided."}
    
    if not settings.TELEGRAM_BOT_TOKEN:
        # Simulate external API call
        time.sleep(1)
        print("\n" + "="*50)
        print(f"📠 [TELEGRAM API SIMULATOR]")
        print(f"⚠️  No TELEGRAM_BOT_TOKEN found in .env!")
        print(f"📤 SENDING MESSAGE TO CHAT_ID: {req.chat_id}")
        print(f"✉️  MESSAGE: {req.message}")
        print("="*50 + "\n")
        return {"status": "success", "detail": f"Simulated Telegram message sent successfully to {req.chat_id}. Add bot token to .env to send real messages!"}

    # Actual Telegram API Call
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": req.chat_id,
        "text": req.message
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=10.0)
            if resp.status_code == 200:
                return {"status": "success", "detail": f"Telegram message sent successfully to {req.chat_id}!"}
            else:
                return {"status": "error", "detail": f"Failed to send Telegram message: {resp.text}"}
    except Exception as e:
        return {"status": "error", "detail": f"Error communicating with Telegram API: {str(e)}"}
