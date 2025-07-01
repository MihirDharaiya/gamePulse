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
        platform = params.get('platform', [None])[0]
        game_name = params.get('game_name', [None])[0]
        sort_by = params.get('sort_by', ['total_views'])[0]
        
        sort_column = "total_views"
        if sort_by == "subscriber_count":
            sort_column = "subscriber_count"
        elif sort_by == "engagement_score":
            sort_column = "CASE WHEN video_count > 0 THEN total_views::FLOAT / video_count ELSE 0 END"
            
        query = f"""
            SELECT creator_id, name, platform, subscriber_count, video_count, total_views, game_name,
                CASE WHEN video_count > 0 THEN total_views::FLOAT / video_count ELSE 0 END AS engagement_score
            FROM creator_stats
            WHERE DATE(timestamp) = (
                SELECT DATE(MAX(timestamp))
                FROM creator_stats
            )
        """
        query_params = []
        if platform:
            query += " AND platform = %s"
            query_params.append(platform)
        if game_name:
            query += " AND game_name = %s"
            query_params.append(game_name)
        query += f" ORDER BY {sort_column} DESC, name ASC LIMIT %s"
        query_params.append(limit)
        
        result = execute_query(query, query_params)
        self.wfile.write(json.dumps(result).encode())
        return 