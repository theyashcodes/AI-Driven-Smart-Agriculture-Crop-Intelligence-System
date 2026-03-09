
import joblib
import numpy as np

model = joblib.load("models/crop_model.pkl")

def test_prediction():
    data = np.array([[30,60,40]])
    result = model.predict(data)
    assert result is not None
