from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_approved: bool
    subscription_tier: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class FarmCreate(BaseModel):
    name: str
    location: Optional[str] = None

class FarmResponse(FarmCreate):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SensorData(BaseModel):
    field_id: int
    temperature: float
    humidity: float
    soil_moisture: float
    ph_level: float
    timestamp: Optional[datetime] = None
