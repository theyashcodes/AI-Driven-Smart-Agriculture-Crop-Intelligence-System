from fastapi import APIRouter, Depends
from .deps import get_current_user
from .. import models

router = APIRouter()

@router.get("/forecast")
def get_weather_forecast(current_user: models.User = Depends(get_current_user)):
    # Mock API response for 5-day forecast
    return {
        "location": "Regional Farm Area",
        "forecast": [
            {"day": "Today", "temp": "28°C", "condition": "Sunny", "rain_chance": "10%"},
            {"day": "Tomorrow", "temp": "30°C", "condition": "Partly Cloudy", "rain_chance": "20%"},
            {"day": "Day 3", "temp": "25°C", "condition": "Rainy", "rain_chance": "85%"},
            {"day": "Day 4", "temp": "24°C", "condition": "Thunderstorms", "rain_chance": "90%"},
            {"day": "Day 5", "temp": "26°C", "condition": "Cloudy", "rain_chance": "40%"},
        ]
    }
