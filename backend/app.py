from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from dotenv import load_dotenv
import os
import pandas as pd

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

@app.get("/trending-games")
async def get_trending_games(limit: int = 10, genre: str = None, source: str = None):
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        query = """
            SELECT DISTINCT name, player_count, price, avg_playtime, genres, timestamp, source
            FROM game_stats
            WHERE DATE(timestamp) = (
                SELECT DATE(MAX(timestamp))
                FROM game_stats
            )
        """
        params = [limit]
        if genre:
            query += " AND genres LIKE %s"
            params.insert(0, f"%{genre}%")
        if source:
            query += " AND source = %s"
            params.insert(0, source)
        query += " ORDER BY player_count DESC, name ASC LIMIT %s"
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        return df.to_dict(orient="records")
    except psycopg2.Error as e:
        return {"error": f"Database query error: {str(e)}"}

@app.get("/top-genres")
async def get_top_genres():
    try:
        conn = psycopg2.connect(SUPABASE_URL)
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
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df.to_dict(orient="records")
    except psycopg2.Error as e:
        return {"error": f"Database query error: {str(e)}"}

@app.get("/playtime-insights")
async def get_playtime_insights():
    try:
        conn = psycopg2.connect(SUPABASE_URL)
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
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df.to_dict(orient="records")
    except psycopg2.Error as e:
        return {"error": f"Database query error: {str(e)}"}

@app.get("/affordable-games")
async def get_affordable_games():
    try:
        conn = psycopg2.connect(SUPABASE_URL)
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
                    price ~ '^\$?\d*\.?\d{0,2}$'
                    AND CAST(REGEXP_REPLACE(price, '[^\d.]', '') AS FLOAT) <= 10.0
                )
            )
            ORDER BY player_count DESC, name ASC
            LIMIT 5
        """
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df.to_dict(orient="records")
    except psycopg2.Error as e:
        return {"error": f"Database query error: {str(e)}"}

@app.get("/top-creators")
async def get_top_creators(limit: int = 10, platform: str = None, game_name: str = None, sort_by: str = "total_views"):
    try:
        conn = psycopg2.connect(SUPABASE_URL)
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
        params = [limit]
        if platform:
            query += " AND platform = %s"
            params.insert(0, platform)
        if game_name:
            query += " AND game_name = %s"
            params.insert(0, game_name)
        query += f" ORDER BY {sort_column} DESC, name ASC LIMIT %s"
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        return df.to_dict(orient="records")
    except psycopg2.Error as e:
        return {"error": f"Database query error: {str(e)}"}