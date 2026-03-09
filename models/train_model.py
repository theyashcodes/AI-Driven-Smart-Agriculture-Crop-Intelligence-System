
import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import os

data = {
    "temperature":[25,30,35,28,32],
    "humidity":[60,55,70,65,50],
    "soil_moisture":[30,40,20,35,45],
    "yield":[200,220,180,210,230]
}

df = pd.DataFrame(data)

X = df[["temperature","humidity","soil_moisture"]]
y = df["yield"]

model = LinearRegression()
model.fit(X,y)

os.makedirs("models", exist_ok=True)
joblib.dump(model,"models/crop_model.pkl")

print("Model trained successfully")
