# 🌱 AI-Driven Smart Agriculture & Crop Intelligence System

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/backend-FastAPI-009688)
![React](https://img.shields.io/badge/frontend-Next.js-black)
![Database](https://img.shields.io/badge/db-PostgreSQL_|_MongoDB-green)

A production-grade Precision Farming Intelligence Platform that leverages AI and IoT to provide real-time crop health monitoring, smart irrigation recommendations, and yield forecasting. Built with a scalable microservices architecture.

---

## 🏗️ Architecture Stack

This repository follows an **Industry-Standard** microservice setup:

- **IoT Layer (`/iot-simulator`)**: Python script simulating edge sensor data publishing via MQTT (Mosquitto Broker).
- **Backend APIs (`/backend`)**: FastAPI providing high-performance REST APIs, JWT Auth, and MQTT ingestion.
- **Machine Learning (`/ml-models`)**: Random Forest Classification algorithms for irrigation needs and yield targets.
- **Database Layer (`/infra`)**: 
  - **PostgreSQL**: Relational tracking of Users, Farms, Fields, Alerts.
  - **MongoDB**: High-throughput time-series storage for raw IoT sensor telemetry.
- **Frontend Dashboard (`/frontend`)**: Next.js (React), TailwindCSS, Recharts. Beautiful, dynamic, real-time analytics.
- **DevOps (`/.github`, `/docker`)**: Docker Compose for localized orchestration, GitHub Actions CI/CD pipelines.

---

## 🚀 Quick Setup & Deployment

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.10+

### 1. Spin up the Infrastructure (Databases & MQTT Broker)
```bash
docker compose up -d postgres mongodb mosquitto
```

### 2. Start the Backend API
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Swagger UI API Docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Generate ML Models & Run IoT Simulator
```bash
# In a new terminal, generate ML Models
cd ml-models
pip install -r requirements.txt
python train.py

# In another terminal, simulate IoT devices
cd iot-simulator
pip install -r requirements.txt
python simulator.py
```

### 4. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Dashboard available at: [http://localhost:3000](http://localhost:3000)

---

## 🧠 Machine Learning Engine
- **Synthetic Agricultural Dataset**: Generates localized testing data including Temperature, Humidity, Soil Moisture, and pH.
- **Irrigation Model**: Recommends immediate action if critical thresholds are met.
- **Yield Forecasting Model**: Predicts end-of-season yield based on combined telemetry variables minimizing Root Mean Squared Error (RMSE).

## 🛡️ CI/CD Pipeline
GitHub Actions automatically lints Code, runs `pytest` on the FastAPI backend, and validates Next.js builds on every Pull Request to `main`.

---
*Built as a Senior-Level Portfolio Architecture Project demonstrating full-stack engineering, scalable system design, and AI integration.*
