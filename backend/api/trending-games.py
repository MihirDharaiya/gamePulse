from http.server import BaseHTTPRequestHandler
import json
import os
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Debug response
            response = {
                "message": "Trending games endpoint working!",
                "supabase_url_set": SUPABASE_URL is not None,
                "supabase_url_length": len(SUPABASE_URL) if SUPABASE_URL else 0,
                "path": self.path
            }
            
            self.wfile.write(json.dumps(response).encode())
            return
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())
            return 