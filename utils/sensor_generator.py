
import random

def generate_sensor_data():
    return {
        "temperature": random.uniform(20,40),
        "humidity": random.uniform(30,90),
        "soil_moisture": random.uniform(10,70)
    }
