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
        
        # Parse query parameters
        from urllib.parse import urlparse, parse_qs
        parsed_url = urlparse(self.path)
        params = parse_qs(parsed_url.query)
        
        limit = int(params.get('limit', [10])[0])
        genre = params.get('genre', [None])[0]
        source = params.get('source', [None])[0]
        
        query = """
            SELECT DISTINCT name, player_count, price, avg_playtime, genres, timestamp, source
            FROM game_stats
            WHERE DATE(timestamp) = (
                SELECT DATE(MAX(timestamp))
                FROM game_stats
            )
        """
        query_params = []
        if genre:
            query += " AND genres LIKE %s"
            query_params.append(f"%{genre}%")
        if source:
            query += " AND source = %s"
            query_params.append(source)
        query += " ORDER BY player_count DESC, name ASC LIMIT %s"
        query_params.append(limit)
        
        result = execute_query(query, query_params)
        self.wfile.write(json.dumps(result).encode())
        return 