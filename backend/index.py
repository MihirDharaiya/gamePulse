from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        path = urlparse(self.path).path
        
        if path == '/':
            response = {
                "message": "GamePulse API is running!",
                "endpoints": [
                    "/trending-games",
                    "/top-genres",
                    "/playtime-insights",
                    "/affordable-games",
                    "/top-creators"
                ]
            }
        elif path == '/trending-games':
            response = {
                "message": "Trending games endpoint",
                "data": [],
                "status": "working"
            }
        elif path == '/top-genres':
            response = {
                "message": "Top genres endpoint",
                "data": [],
                "status": "working"
            }
        elif path == '/playtime-insights':
            response = {
                "message": "Playtime insights endpoint",
                "data": [],
                "status": "working"
            }
        elif path == '/affordable-games':
            response = {
                "message": "Affordable games endpoint",
                "data": [],
                "status": "working"
            }
        elif path == '/top-creators':
            response = {
                "message": "Top creators endpoint",
                "data": [],
                "status": "working"
            }
        else:
            response = {
                "error": "Endpoint not found",
                "path": path,
                "available_endpoints": [
                    "/trending-games",
                    "/top-genres",
                    "/playtime-insights",
                    "/affordable-games",
                    "/top-creators"
                ]
            }
        
        self.wfile.write(json.dumps(response).encode())
        return 