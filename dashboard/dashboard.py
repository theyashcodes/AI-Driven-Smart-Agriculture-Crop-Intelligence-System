
import streamlit as st
import joblib
import numpy as np

model = joblib.load("models/crop_model.pkl")

st.title("🌱 Smart Agriculture AI Dashboard")

temp = st.slider("Temperature",20,40)
humidity = st.slider("Humidity",30,90)
moisture = st.slider("Soil Moisture",10,70)

if st.button("Predict Crop Yield"):
    data = np.array([[temp,humidity,moisture]])
    prediction = model.predict(data)
    st.success(f"Predicted Crop Yield: {prediction[0]}")
