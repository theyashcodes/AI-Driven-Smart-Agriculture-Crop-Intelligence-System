import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Agriculture API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://admin:admin123@localhost:5432/agri_db")
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://admin:admin123@localhost:27017/")
    MONGO_DB: str = "agri_mongo_db"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MQTT_BROKER_URL: str = os.getenv("MQTT_BROKER_URL", "localhost")
    MQTT_PORT: int = int(os.getenv("MQTT_PORT", 1883))

    class Config:
        env_file = ".env"

settings = Settings()
