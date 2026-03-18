from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .app.core.config import settings
from .app.api import auth, farms, predictions
from .app.services.mqtt_service import start_mqtt
from .app.database import engine, Base
import asyncio

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(farms.router, prefix="/api/farms", tags=["farms"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])

@app.on_event("startup")
async def startup_event():
    # Start MQTT listener in background
    start_mqtt()

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Agriculture API"}
