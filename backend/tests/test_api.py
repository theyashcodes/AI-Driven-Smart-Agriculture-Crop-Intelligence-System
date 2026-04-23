import os
import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["MONGO_URL"] = "mongodb://<test_mongo_user>:<test_mongo_pass>@localhost:27017/"
os.environ["JWT_SECRET"] = "testsecret"
from main import app
from app.database import Base, engine, SessionLocal
from app.models import User

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the AI Agriculture API"}

def test_signup():
    response = client.post(
        "/api/auth/signup",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data

def test_login():
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_protected_route_without_token():
    response = client.get("/api/farms/")
    # Expected 401 Unauthorized because we secured it
    assert response.status_code == 401

def test_predictions_yield_without_token():
    response = client.post(
        "/api/predictions/yield",
        json={"temperature": 25, "humidity": 60, "soil_moisture": 40, "ph_level": 6.5}
    )
    assert response.status_code == 401
