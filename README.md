
# AI-Driven Smart Agriculture Crop Intelligence System

An AI-powered agriculture system that predicts crop yield and provides irrigation recommendations using machine learning and sensor data.

## Features
- Crop yield prediction
- Simulated IoT sensor data
- Irrigation recommendations
- Streamlit dashboard
- REST API
- Authentication module
- Satellite crop monitoring (NDVI)
- Plant disease detection

## Run Project

Train model:
python models/train_model.py

Run dashboard:
streamlit run dashboard/dashboard.py

Run API:
uvicorn api.api:app --reload
