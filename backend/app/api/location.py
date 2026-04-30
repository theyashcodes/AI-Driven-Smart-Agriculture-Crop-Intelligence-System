from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

@router.get("/search")
async def search_location(query: str):
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=en&format=json"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            if "results" in data:
                return data["results"]
            return []
        else:
            raise HTTPException(status_code=500, detail="Error fetching location data")

@router.get("/metrics")
async def get_location_metrics(lat: float, lng: float):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,precipitation&hourly=soil_moisture_0_to_1cm"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            
            current = data.get("current", {})
            hourly = data.get("hourly", {})
            
            soil_moisture = hourly.get("soil_moisture_0_to_1cm", [0])[0] if hourly.get("soil_moisture_0_to_1cm") else 0
            soil_moisture_pct = round(soil_moisture * 100, 1)

            return {
                "temperature": current.get("temperature_2m", 0),
                "humidity": current.get("relative_humidity_2m", 0),
                "precipitation": current.get("precipitation", 0),
                "moisture": soil_moisture_pct
            }
        else:
            raise HTTPException(status_code=500, detail="Error fetching weather metrics")
