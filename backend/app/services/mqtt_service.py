import paho.mqtt.client as mqtt
import json
from datetime import datetime
import asyncio
from ..database import sensor_collection
from ..core.config import settings
from ..api.websockets import manager

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    client.subscribe("farm/sensors")

main_loop = None

async def insert_sensor_data(payload):
    # Broadcast before insertion to avoid _id serialization issues
    if 'field_id' in payload:
        await manager.broadcast_to_farm(payload['field_id'], payload)
    await sensor_collection.insert_one(payload)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        payload['timestamp'] = datetime.utcnow()
        
        global main_loop
        if main_loop and main_loop.is_running():
            asyncio.run_coroutine_threadsafe(insert_sensor_data(payload), main_loop)
            
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

def get_mqtt_client():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    return client

def start_mqtt():
    try:
        global main_loop
        main_loop = asyncio.get_running_loop()
        client = get_mqtt_client()
        client.connect(settings.MQTT_BROKER_URL, settings.MQTT_PORT, 60)
        client.loop_start()  # Runs in a background thread
        print("MQTT Listener started")
    except Exception as e:
        print(f"Failed to start MQTT listener: {e}")
