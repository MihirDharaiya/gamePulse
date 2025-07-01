from http.server import BaseHTTPRequestHandler
import json
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")

def execute_query(query, params=None):
    """Helper function to execute SQL queries and return results as dictionaries"""
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cursor = conn.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
            
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        return {"error": f"Database query error: {str(e)}"}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        query = """
            SELECT name, avg_playtime, genres, source
            FROM game_stats
            WHERE DATE(timestamp) = (
                SELECT DATE(MAX(timestamp))
                FROM game_stats
            )
            ORDER BY avg_playtime DESC
            LIMIT 5
        """
        
        result = execute_query(query)
        self.wfile.write(json.dumps(result).encode())
        return 