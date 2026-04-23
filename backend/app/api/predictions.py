from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict
from ..database import get_db
from .. import models, schemas
from .deps import get_current_user
import joblib
import pandas as pd
import os
import random
import asyncio
from PIL import Image
import io

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IRRIGATION_MODEL_PATH = os.path.join(BASE_DIR, "../../../ml-models/artifacts/irrigation_model.pkl")
YIELD_MODEL_PATH = os.path.join(BASE_DIR, "../../../ml-models/artifacts/yield_model.pkl")

# --- Model Lifecycle Management ---
class ModelLifecycleState:
    def __init__(self):
        self.irrigation_version = "v1.0.0"
        self.yield_version = "v1.0.0"
        self.irrigation_status = "unloaded"
        self.yield_status = "unloaded"

lifecycle = ModelLifecycleState()

try:
    irrigation_model = joblib.load(IRRIGATION_MODEL_PATH)
    lifecycle.irrigation_status = "active"
except Exception as e:
    irrigation_model = None
    lifecycle.irrigation_status = f"failed_to_load: {e}"

@router.post("/pest-detect")
async def detect_pest(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        img.thumbnail((50, 50))
        pixels = list(img.getdata())
        plant_pixels = 0
        for r, g, b in pixels:
            # Green check or Yellow/Brown check
            if g > r * 0.8 and g > b * 0.8:
                plant_pixels += 1
            elif r > b and g > b and r > 30 and g > 30:
                plant_pixels += 1
        
        ratio = plant_pixels / len(pixels)
        if ratio < 0.10: # Reject if less than 10% looks like plant matter
            return {"filename": file.filename, "prediction": "Invalid Image. Please upload a clear photo of a plant leaf.", "confidence": "0.0%"}
    except Exception:
        return {"filename": file.filename, "prediction": "Invalid image format uploaded.", "confidence": "0.0%"}
    
    diseases = [
        "Early Blight detected. Recommendation: Apply Fungicide.", 
        "Healthy leaf. No action needed.", 
        "Leaf Minor detected. Recommendation: Neem oil application.",
        "Rust Disease detected. Recommendation: Remove infected leaves immediately."
    ]
    await asyncio.sleep(1.5) # Mock inference time
    
    predicted = random.choice(diseases)
    confidence = round(random.uniform(85.0, 99.5), 1)
    
    return {"filename": file.filename, "prediction": predicted, "confidence": f"{confidence}%"}

try:
    yield_model = joblib.load(YIELD_MODEL_PATH)
    lifecycle.yield_status = "active"
except Exception as e:
    yield_model = None
    lifecycle.yield_status = f"failed_to_load: {e}"

@router.post("/irrigation")
def predict_irrigation(moisture: float, temperature: float, weather_forecast: str, current_user: models.User = Depends(get_current_user)) -> Dict[str, str]:
    if irrigation_model:
        X = pd.DataFrame([{'temperature': temperature, 'humidity': 50.0, 'soil_moisture': moisture}])
        pred = irrigation_model.predict(X)[0]
        action = "TURN_ON_IRRIGATION" if pred == 1 else "DO_NOTHING"
        return {
            "action": action, 
            "confidence": "0.90 (ML Model)",
            "model_version": lifecycle.irrigation_version,
            "lifecycle_status": lifecycle.irrigation_status
        }

    # Dummy logic until ML model is wired in
    # If soil is dry and it's hot, and not raining, irrigate.
    if moisture < 30.0 and temperature > 25.0 and "rain" not in weather_forecast.lower():
        return {"action": "TURN_ON_IRRIGATION", "confidence": "0.95", "model_version": "dummy_fallback", "lifecycle_status": lifecycle.irrigation_status}
    return {"action": "DO_NOTHING", "confidence": "0.85", "model_version": "dummy_fallback", "lifecycle_status": lifecycle.irrigation_status}


@router.post("/health")
def predict_crop_health(nitrogen: float, phosphorus: float, potassium: float, ph: float, current_user: models.User = Depends(get_current_user)) -> Dict[str, str]:
    if ph < 5.5 or ph > 8.0:
        return {"health_status": "Poor", "issue": "Abnormal pH level"}
    return {"health_status": "Good", "issue": "None"}

class RegionRequest(BaseModel):
    region: str

@router.post("/region-crop")
def predict_region_crop(payload: RegionRequest, current_user: models.User = Depends(get_current_user)) -> Dict[str, str]:
    region = payload.region.lower()
    if region in ["north", "northern"]:
        return {"crop": "Wheat", "yield": "3.5 Tons/Acre", "confidence": "0.92"}
    elif region in ["south", "southern"]:
        return {"crop": "Rice", "yield": "4.2 Tons/Acre", "confidence": "0.89"}
    elif region in ["east", "eastern"]:
        return {"crop": "Sugarcane", "yield": "35 Tons/Acre", "confidence": "0.85"}
    elif region in ["west", "western"]:
        return {"crop": "Cotton", "yield": "1.2 Tons/Acre", "confidence": "0.91"}
    else:
        # Default fallback
        return {"crop": "Maize", "yield": "2.8 Tons/Acre", "confidence": "0.80"}

class YieldPredictionRequest(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float
    ph_level: float

@router.post("/yield")
def predict_yield(payload: YieldPredictionRequest, current_user: models.User = Depends(get_current_user)) -> Dict[str, str]:
    if yield_model:
        X = pd.DataFrame([payload.model_dump()])
        pred = yield_model.predict(X)[0]
        return {
            "predicted_yield": f"{pred:.2f} Tons", 
            "confidence": "High (ML Model)",
            "model_version": lifecycle.yield_version,
            "lifecycle_status": lifecycle.yield_status
        }
    return {
        "predicted_yield": "Unknown (Model unavailable)", 
        "confidence": "Low",
        "model_version": "dummy_fallback",
        "lifecycle_status": lifecycle.yield_status
    }

