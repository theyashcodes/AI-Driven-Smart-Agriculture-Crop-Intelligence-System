import paho.mqtt.client as mqtt
import time
import json
import random

BROKER_URL = "localhost"
PORT = 1883
TOPIC = "farm/sensors"

client = mqtt.Client()
client.connect(BROKER_URL, PORT, 60)

def simulate_sensor(field_id):
    # Simulated values based on normal ranges
    temp = round(random.uniform(15.0, 35.0), 2)
    humidity = round(random.uniform(40.0, 80.0), 2)
    moisture = round(random.uniform(20.0, 60.0), 2)
    ph = round(random.uniform(5.5, 7.5), 2)
    
    payload = {
        "field_id": field_id,
        "temperature": temp,
        "humidity": humidity,
        "soil_moisture": moisture,
        "ph_level": ph
    }
    return payload

try:
    print(f"Starting IoT Simulator matching broker {BROKER_URL}:{PORT}")
    while True:
        # Simulate data for distinct fields by adding to this list (e.g. [1, 2, 3])
        for field_id in [1, 2]:
            data = simulate_sensor(field_id)
            client.publish(TOPIC, json.dumps(data))
            print(f"Published to {TOPIC}: {data}")
        time.sleep(5) # publish every 5 seconds
        
except KeyboardInterrupt:
    print("Simulator stopped.")
finally:
    client.disconnect()
