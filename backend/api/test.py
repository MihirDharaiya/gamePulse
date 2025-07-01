from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "message": "GamePulse API is working!",
            "path": self.path,
            "endpoints": [
                "/api/trending-games",
                "/api/top-genres",
                "/api/playtime-insights", 
                "/api/affordable-games",
                "/api/top-creators"
            ]
        }
        
        self.wfile.write(json.dumps(response).encode())
        return 