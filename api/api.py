
from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("models/crop_model.pkl")

@app.get("/predict")
def predict(temp:float, humidity:float, moisture:float):
    data = np.array([[temp,humidity,moisture]])
    prediction = model.predict(data)
    return {"predicted_yield": float(prediction[0])}
