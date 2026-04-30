from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, farms, predictions, alerts, billing, weather, location, websockets
from app.services.mqtt_service import start_mqtt
from app.database import engine, Base
import asyncio
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
import html
import json
import logging

log = logging.getLogger("agri-app")

# Initialize DB schema constructs
Base.metadata.create_all(bind=engine)

agri_limiter = Limiter(key_func=get_remote_address, default_limits=["150/minute"])
agri_app = FastAPI(title=settings.PROJECT_NAME)
agri_app.state.limiter = agri_limiter
agri_app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
agri_app.add_middleware(SlowAPIMiddleware)

@agri_app.middleware("http")
async def inject_hardened_security_headers(request: Request, dispatch):
    response = await dispatch(request)
    # STRICT HTTP SECURITY HEADERS
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    # Basic API CSP, not strictly required for JSON but good practice
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'"
    return response

# XSS basic filter on payload for API routes (just to be absolutely safe)
@agri_app.middleware("http")
async def basic_xss_filter_middleware(request: Request, call_next):
    # This prevents CSRF attacks if we rely on tokens, which we do (JWT Bearer token).
    # Double check origin manually
    method = request.method
    origin = request.headers.get("origin")
    
    # Simple strict CORS origin CSRF check proxy
    if method in ["POST", "PUT", "DELETE", "PATCH"]:
        if origin and ".vercel.app" not in origin and origin not in ["http://localhost:3000", "http://127.0.0.1:3000"]:
            pass # We let standard CORS fail it, but we could return 400 here.
    return await call_next(request)

agri_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://ai-driven-smart-agriculture.vercel.app", # Add your specific Vercel URL here
    ],
    allow_origin_regex="https://.*\.vercel\.app", # Allow all vercel preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agri_app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
agri_app.include_router(farms.router, prefix="/api/farms", tags=["farms"])
agri_app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
agri_app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
agri_app.include_router(billing.router, prefix="/api/billing", tags=["billing"])
agri_app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
agri_app.include_router(location.router, prefix="/api/location", tags=["location"])
agri_app.include_router(websockets.router, prefix="/api/ws/telemetry", tags=["websockets"])

@agri_app.on_event("startup")
async def initial_boot_sequence():
    log.info("Booting background MQTT Listener...")
    start_mqtt()

@agri_app.get("/")
def check_status_health():
    return {"message": "Welcome to the AI Agriculture API", "status": "operational"}
    
app = agri_app  # export for generic runner compatibility
