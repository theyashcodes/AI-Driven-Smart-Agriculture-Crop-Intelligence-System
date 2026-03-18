from fastapi import APIRouter
from typing import Dict

router = APIRouter()

@router.post("/irrigation")
def predict_irrigation(moisture: float, temperature: float, weather_forecast: str) -> Dict[str, str]:
    # Dummy logic until ML model is wired in
    # If soil is dry and it's hot, and not raining, irrigate.
    if moisture < 30.0 and temperature > 25.0 and "rain" not in weather_forecast.lower():
        return {"action": "TURN_ON_IRRIGATION", "confidence": "0.95"}
    return {"action": "DO_NOTHING", "confidence": "0.85"}

@router.post("/health")
def predict_crop_health(nitrogen: float, phosphorus: float, potassium: float, ph: float) -> Dict[str, str]:
    if ph < 5.5 or ph > 8.0:
        return {"health_status": "Poor", "issue": "Abnormal pH level"}
    return {"health_status": "Good", "issue": "None"}
