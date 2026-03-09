
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np

def load_model():
    return tf.keras.models.load_model("plant_disease_model.h5")

def predict_disease(model, img_path):

    img = image.load_img(img_path, target_size=(224,224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)

    classes = ["Healthy", "Leaf Spot", "Rust", "Blight"]

    return classes[np.argmax(prediction)]
