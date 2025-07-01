from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from dotenv import load_dotenv
import os
from typing import Optional

app = FastAPI(title="Gaming Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")

@app.get("/")
async def root():
    return {
        "message": "GamePulse API is running!",
        "endpoints": [
            "/trending-games",
            "/top-genres", 
            "/playtime-insights",
            "/affordable-games",
            "/top-creators"
        ]
    }

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
    except psycopg2.Error as e:
        return {"error": f"Database query error: {str(e)}"}

@app.get("/trending-games")
async def get_trending_games(limit: int = 10, genre: Optional[str] = None, source: Optional[str] = None):
    query = """
        SELECT DISTINCT name, player_count, price, avg_playtime, genres, timestamp, source
        FROM game_stats
        WHERE DATE(timestamp) = (
            SELECT DATE(MAX(timestamp))
            FROM game_stats
        )
    """
    params = []
    if genre:
        query += " AND genres LIKE %s"
        params.append(f"%{genre}%")
    if source:
        query += " AND source = %s"
        params.append(source)
    query += " ORDER BY player_count DESC, name ASC LIMIT %s"
    params.append(limit)
    
    return execute_query(query, params)

@app.get("/top-genres")
async def get_top_genres():
    query = """
        SELECT UNNEST(STRING_TO_ARRAY(genres, ', ')) AS genre, SUM(player_count) AS total_players
        FROM game_stats
        WHERE DATE(timestamp) = (
            SELECT DATE(MAX(timestamp))
            FROM game_stats
        )
        GROUP BY genre
        ORDER BY total_players DESC
        LIMIT 5
    """
    return execute_query(query)

@app.get("/playtime-insights")
async def get_playtime_insights():
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
    return execute_query(query)

@app.get("/affordable-games")
async def get_affordable_games():
    query = """
        SELECT name, player_count, price, genres, source
        FROM game_stats
        WHERE DATE(timestamp) = (
            SELECT DATE(MAX(timestamp))
            FROM game_stats
        )
        AND (
            price = 'Free'
            OR (
                price ~ '^\\$?\\d*\\.?\\d{0,2}$'
                AND CAST(REGEXP_REPLACE(price, '[^\\d.]', '') AS FLOAT) <= 10.0
            )
        )
        ORDER BY player_count DESC, name ASC
        LIMIT 5
    """
    return execute_query(query)

@app.get("/top-creators")
async def get_top_creators(limit: int = 10, platform: Optional[str] = None, game_name: Optional[str] = None, sort_by: str = "total_views"):
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
    params = []
    if platform:
        query += " AND platform = %s"
        params.append(platform)
    if game_name:
        query += " AND game_name = %s"
        params.append(game_name)
    query += f" ORDER BY {sort_column} DESC, name ASC LIMIT %s"
    params.append(limit)
    
    return execute_query(query, params)