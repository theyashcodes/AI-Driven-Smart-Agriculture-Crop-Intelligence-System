from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from .. import models, schemas
from ..database import get_db
from ..core.security import get_password_hash, verify_password, create_access_token
from ..core.config import settings
from .deps import get_current_admin
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

@router.post("/signup", response_model=schemas.UserResponse)
@limiter.limit("5/minute")
def register_new_account(request: Request, payload: schemas.UserCreate, db_session: Session = Depends(get_db)):
    existing_record = db_session.query(models.User).filter(models.User.email == payload.email).first()
    if existing_record:
        raise HTTPException(status_code=400, detail="Account with this email already exists in the system")
    
    hashed_secret = get_password_hash(payload.password)
    fresh_user = models.User(username=payload.username, email=payload.email, hashed_password=hashed_secret)
    db_session.add(fresh_user)
    db_session.commit()
    db_session.refresh(fresh_user)
    return fresh_user

@router.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")
def authenticate_and_generate_token(
    request: Request, 
    credentials: OAuth2PasswordRequestForm = Depends(), 
    db_session: Session = Depends(get_db)
):
    # Verify limiter works via main app middleware
    account = db_session.query(models.User).filter(models.User.username == credentials.username).first()
    
    if not account or not verify_password(credentials.password, account.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not account.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your profile is currently waiting for administrator approval.",
        )
        
    duration_offset = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_string = create_access_token(
        data={"sub": account.username}, expires_delta=duration_offset
    )
    return {"access_token": jwt_string, "token_type": "bearer"}

@router.get("/users", response_model=List[schemas.UserResponse])
def fetch_system_users(db_session: Session = Depends(get_db), admin_supervisor: models.User = Depends(get_current_admin)):
    return db_session.query(models.User).all()

@router.put("/users/{user_id}/approve", response_model=schemas.UserResponse)
def grant_user_approval(user_id: int, db_session: Session = Depends(get_db), admin_supervisor: models.User = Depends(get_current_admin)):
    target_profile = db_session.query(models.User).filter(models.User.id == user_id).first()
    if not target_profile:
        raise HTTPException(status_code=404, detail="Target user profile could not be located in database")
    target_profile.is_approved = True
    db_session.commit()
    db_session.refresh(target_profile)
    return target_profile
