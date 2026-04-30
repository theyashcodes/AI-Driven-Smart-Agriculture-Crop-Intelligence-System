from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import logging

router = APIRouter()
logger = logging.getLogger("agri-app")

class ConnectionManager:
    def __init__(self):
        # Map farm_id to a list of active websocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, farm_id: int):
        await websocket.accept()
        if farm_id not in self.active_connections:
            self.active_connections[farm_id] = []
        self.active_connections[farm_id].append(websocket)
        logger.info(f"WebSocket connected for farm {farm_id}")

    def disconnect(self, websocket: WebSocket, farm_id: int):
        if farm_id in self.active_connections:
            try:
                self.active_connections[farm_id].remove(websocket)
            except ValueError:
                pass
            if not self.active_connections[farm_id]:
                del self.active_connections[farm_id]
        logger.info(f"WebSocket disconnected for farm {farm_id}")

    async def broadcast_to_farm(self, farm_id: int, message: dict):
        if farm_id in self.active_connections:
            for connection in self.active_connections[farm_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending to websocket: {e}")
                    self.disconnect(connection, farm_id)

manager = ConnectionManager()

@router.websocket("/{farm_id}")
async def websocket_endpoint(websocket: WebSocket, farm_id: int):
    # In a production app, we would authenticate the websocket connection here
    await manager.connect(websocket, farm_id)
    try:
        while True:
            # We don't expect messages from the client, just keep the connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, farm_id)
