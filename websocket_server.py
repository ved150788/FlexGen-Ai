#!/usr/bin/env python3
"""
WebSocket Server for Real-time Security Dashboard Updates
Monitors security tools and broadcasts updates to connected clients
"""

import asyncio
import json
import logging
import time
import random
from datetime import datetime, timedelta
from typing import Set, Dict, Any
import websockets
from websockets.server import WebSocketServerProtocol
import sqlite3
import requests

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Connected clients
connected_clients: Set[WebSocketServerProtocol] = set()

# Database path for threat intelligence
DB_PATH = "threat_intel.db"

class SecurityDashboardWebSocket:
    def __init__(self):
        self.last_threat_count = 0
        self.monitoring = True
        
    async def register_client(self, websocket: WebSocketServerProtocol):
        """Register a new client connection"""
        connected_clients.add(websocket)
        logger.info(f"Client connected. Total clients: {len(connected_clients)}")
        
        # Send initial status to new client
        await self.send_status_update(websocket)
    
    async def unregister_client(self, websocket: WebSocketServerProtocol):
        """Unregister a client connection"""
        connected_clients.discard(websocket)
        logger.info(f"Client disconnected. Total clients: {len(connected_clients)}")
    
    async def send_to_all_clients(self, message: Dict[str, Any]):
        """Send a message to all connected clients"""
        if not connected_clients:
            return
            
        # Create JSON message
        json_message = json.dumps(message)
        
        # Send to all clients (remove disconnected ones)
        disconnected_clients = set()
        for client in connected_clients:
            try:
                await client.send(json_message)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                logger.error(f"Error sending message to client: {e}")
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        for client in disconnected_clients:
            connected_clients.discard(client)
    
    async def check_service_status(self, service_name: str, endpoint: str) -> str:
        """Check if a service is online"""
        try:
            response = requests.get(endpoint, timeout=5)
            if response.status_code == 200:
                return "online"
            else:
                return "degraded"
        except requests.exceptions.RequestException:
            return "offline"
    
    async def send_status_update(self, websocket: WebSocketServerProtocol = None):
        """Send system status update based on real service availability"""
        try:
            # Check actual service status
            base_url = "http://localhost:5000"
            
            threat_status = await self.check_service_status(
                "threat_intelligence", 
                f"{base_url}/api/tools/threat-intelligence/dashboard/"
            )
            vuln_status = await self.check_service_status(
                "vulnerability_scanner", 
                f"{base_url}/api/tools/vulnerability-scanner/stats"
            )
            api_status = await self.check_service_status(
                "api_fuzzer", 
                f"{base_url}/api/tools/api-fuzzer/stats"
            )
            recon_status = await self.check_service_status(
                "recon_bot", 
                f"{base_url}/api/tools/ai-recon/stats"
            )
            
            status_update = {
                "type": "status_update",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "threatIntelligence": threat_status,
                    "vulnerabilityScanner": vuln_status,
                    "apiFuzzer": api_status,
                    "reconBot": recon_status
                }
            }
            
            if websocket:
                try:
                    await websocket.send(json.dumps(status_update))
                except:
                    pass
            else:
                await self.send_to_all_clients(status_update)
                
        except Exception as e:
            logger.error(f"Error checking service status: {e}")
    
    async def check_threat_intelligence(self):
        """Check for new threats in the threat intelligence database"""
        try:
            # Only proceed if database exists
            import os
            if not os.path.exists(DB_PATH):
                return
                
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.execute('SELECT COUNT(*) FROM ioc')
            current_count = cursor.fetchone()[0]
            conn.close()
            
            if current_count > self.last_threat_count:
                # New threats detected
                new_threats = current_count - self.last_threat_count
                self.last_threat_count = current_count
                
                # Get the latest threat for the update
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.execute(
                    'SELECT type, value, source, confidence_score FROM ioc ORDER BY first_seen DESC LIMIT 1'
                )
                latest_threat = cursor.fetchone()
                conn.close()
                
                if latest_threat:
                    threat_update = {
                        "type": "new_threat",
                        "timestamp": datetime.utcnow().isoformat(),
                        "data": {
                            "indicator": latest_threat[1],
                            "type": latest_threat[0],
                            "riskScore": latest_threat[3] or 7.5,
                            "source": latest_threat[2],
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    }
                    
                    await self.send_to_all_clients(threat_update)
                    logger.info(f"Broadcasted new threat: {latest_threat[1]}")
                    
        except Exception as e:
            logger.error(f"Error checking threat intelligence: {e}")
    
    async def monitor_security_tools(self):
        """Main monitoring loop for all security tools - only real data"""
        logger.info("Starting security tools monitoring")
        
        while self.monitoring:
            try:
                # Check threat intelligence for new threats (real data only)
                await self.check_threat_intelligence()
                
                # Send periodic status updates (every 60 seconds)
                if int(time.time()) % 60 == 0:
                    await self.send_status_update()
                
                # Wait before next check
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(10)  # Wait before retrying
    
    async def handle_client_connection(self, websocket: WebSocketServerProtocol, path: str):
        """Handle a new client connection"""
        await self.register_client(websocket)
        try:
            # Keep connection alive and handle any incoming messages
            async for message in websocket:
                try:
                    data = json.loads(message)
                    logger.info(f"Received message from client: {data}")
                    
                    # Handle client requests (e.g., force refresh)
                    if data.get("type") == "request_status":
                        await self.send_status_update(websocket)
                        
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received: {message}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info("Client connection closed")
        except Exception as e:
            logger.error(f"Error handling client connection: {e}")
        finally:
            await self.unregister_client(websocket)

async def main():
    """Main server function"""
    dashboard_ws = SecurityDashboardWebSocket()
    
    # Start the WebSocket server
    server = await websockets.serve(
        dashboard_ws.handle_client_connection,
        "localhost",
        5001,  # Use port 5001 for WebSocket
        ping_interval=20,
        ping_timeout=10
    )
    
    logger.info("WebSocket server started on ws://localhost:5001")
    logger.info("Only broadcasting real data from actual security tools")
    
    # Start the monitoring task
    monitoring_task = asyncio.create_task(dashboard_ws.monitor_security_tools())
    
    try:
        # Run forever
        await asyncio.gather(
            server.wait_closed(),
            monitoring_task
        )
    except KeyboardInterrupt:
        logger.info("Shutting down WebSocket server...")
        dashboard_ws.monitoring = False
        monitoring_task.cancel()
        server.close()
        await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user") 