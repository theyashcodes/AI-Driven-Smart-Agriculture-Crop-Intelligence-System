from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from .deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class UpgradeRequest(BaseModel):
    tier: str

@router.post("/upgrade")
def upgrade_subscription(req: UpgradeRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if req.tier not in ["free", "pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid tier")
    current_user.subscription_tier = req.tier
    db.commit()
    db.refresh(current_user)
    return {"detail": f"Successfully upgraded to {req.tier} tier", "subscription_tier": current_user.subscription_tier}
