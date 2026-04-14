from fastapi import APIRouter, Depends
from typing import Dict
from pydantic import BaseModel
from .deps import get_current_user
from .. import models
import os
import joblib
import pandas as pd

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IRRIGATION_MODEL_PATH = os.path.join(BASE_DIR, "../../../../ml-models/artifacts/irrigation_model.pkl")
YIELD_MODEL_PATH = os.path.join(BASE_DIR, "../../../../ml-models/artifacts/yield_model.pkl")

try:
    irrigation_model = joblib.load(IRRIGATION_MODEL_PATH)
except Exception:
    irrigation_model = None

try:
    yield_model = joblib.load(YIELD_MODEL_PATH)
except Exception:
    yield_model = None

@router.post("/irrigation")
def predict_irrigation(moisture: float, temperature: float, weather_forecast: str, current_user: models.User = Depends(get_current_user)) -> Dict[str, str]:
    if irrigation_model:
        X = pd.DataFrame([{'temperature': temperature, 'humidity': 50.0, 'soil_moisture': moisture}])
        pred = irrigation_model.predict(X)[0]
        action = "TURN_ON_IRRIGATION" if pred == 1 else "DO_NOTHING"
        return {"action": action, "confidence": "0.90 (ML Model)"}

    # Dummy logic until ML model is wired in
    # If soil is dry and it's hot, and not raining, irrigate.
    if moisture < 30.0 and temperature > 25.0 and "rain" not in weather_forecast.lower():
        return {"action": "TURN_ON_IRRIGATION", "confidence": "0.95"}
    return {"action": "DO_NOTHING", "confidence": "0.85"}


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
        return {"predicted_yield": f"{pred:.2f} Tons", "confidence": "High (ML Model)"}
    return {"predicted_yield": "Unknown (Model unavailable)", "confidence": "Low"}

