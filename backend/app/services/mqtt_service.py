import paho.mqtt.client as mqtt
import json
from datetime import datetime
import asyncio
from ..database import sensor_collection
from ..core.config import settings

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    client.subscribe("farm/sensors")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        payload['timestamp'] = datetime.utcnow()
        
        # Async calls from sync context need to be handled or we use PyMongo for simplicity in the listener thread
        # Or use motor with asyncio.create_task if we have a running event loop
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(sensor_collection.insert_one(payload))
            
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

def get_mqtt_client():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    return client

def start_mqtt():
    try:
        client = get_mqtt_client()
        client.connect(settings.MQTT_BROKER_URL, settings.MQTT_PORT, 60)
        client.loop_start()  # Runs in a background thread
        print("MQTT Listener started")
    except Exception as e:
        print(f"Failed to start MQTT listener: {e}")
