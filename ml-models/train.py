import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
import joblib
import os

print("Generating synthetic agricultural dataset...")
np.random.seed(42)
n_samples = 1000

# Features
temperature = np.random.uniform(15, 40, n_samples)
humidity = np.random.uniform(30, 90, n_samples)
soil_moisture = np.random.uniform(10, 60, n_samples)
ph_level = np.random.uniform(5.0, 8.5, n_samples)

# Targets
# Irrigation needed if moisture < 30 and temp > 30 (simplistic logic for target generation)
irrigation_needed = ((soil_moisture < 30) & (temperature > 30)).astype(int)

# Yield forecasting (Regression)
# Yield is higher when moisture is around 40, temp around 25, ph around 6.5
yield_target = 100 + (40 - abs(soil_moisture - 40)) + (20 - abs(temperature - 25)) + (10 - abs(ph_level - 6.5)*5) + np.random.normal(0, 5, n_samples)

df = pd.DataFrame({
    'temperature': temperature,
    'humidity': humidity,
    'soil_moisture': soil_moisture,
    'ph_level': ph_level,
    'irrigation_needed': irrigation_needed,
    'yield_target': yield_target
})

os.makedirs('artifacts', exist_ok=True)

# 1. Irrigation Classification Model
print("\nTraining Irrigation Prediction Model...")
X = df[['temperature', 'humidity', 'soil_moisture']]
y = df['irrigation_needed']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
print(f"Irrigation Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")
joblib.dump(clf, 'artifacts/irrigation_model.pkl')

# 2. Yield Forecasting Regression Model
print("\nTraining Yield Forecasting Model...")
X_yield = df[['temperature', 'humidity', 'soil_moisture', 'ph_level']]
y_yield = df['yield_target']
X_train_y, X_test_y, y_train_y, y_test_y = train_test_split(X_yield, y_yield, test_size=0.2, random_state=42)

reg = RandomForestRegressor(n_estimators=100, random_state=42)
reg.fit(X_train_y, y_train_y)
y_pred_y = reg.predict(X_test_y)
print(f"Yield Model RMSE: {np.sqrt(mean_squared_error(y_test_y, y_pred_y)):.2f}")
joblib.dump(reg, 'artifacts/yield_model.pkl')

print("\nModels successfully trained and saved to artifacts/ directory.")
