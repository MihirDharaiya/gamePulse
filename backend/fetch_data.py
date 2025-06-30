import requests
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime
from celery import Celery
import time
import re

load_dotenv()
STEAM_API_KEY = os.getenv("STEAM_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")

app = Celery('tasks', broker='redis://localhost:6379/0')

def clean_price(price_str):
    """Clean and validate price string, return 'Free' or formatted price (e.g., '$4.60')."""
    if not price_str or price_str.lower() == "free":
        return "Free"
    # Extract valid price format (e.g., '4.60' from '$4.60' or malformed '.4.60')
    match = re.match(r'^\$?(\d*\.?\d{0,2})$', price_str.replace('$', ''))
    if match:
        return f"${match.group(1)}"
    print(f"Invalid price format: {price_str}, defaulting to 'N/A'")
    return "N/A"

def fetch_top_games():
    try:
        url = "https://steamspy.com/api.php?request=top100in2weeks"
        response = requests.get(url)
        response.raise_for_status()
        games = response.json()
        print(f"Fetched {len(games)} games from SteamSpy")
        return games
    except requests.RequestException as e:
        print(f"Error fetching top games: {e}")
        return {}

def fetch_game_details(appid, name):
    try:
        player_url = f"https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?key={STEAM_API_KEY}&appid={appid}"
        player_response = requests.get(player_url)
        player_response.raise_for_status()
        player_count = player_response.json().get("response", {}).get("player_count", 0)

        price_url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
        price_response = requests.get(price_url)
        price_response.raise_for_status()
        app_data = price_response.json()[str(appid)]
        if not app_data.get("success", False):
            raise ValueError("Steam API returned unsuccessful response")
        app_data = app_data.get("data", {})
        raw_price = app_data.get("price_overview", {}).get("final_formatted", "Free")
        price = clean_price(raw_price)
        genres = ", ".join([genre["description"] for genre in app_data.get("genres", [])]) or "N/A"

        steamspy_url = f"https://steamspy.com/api.php?request=appdetails&appid={appid}"
        steamspy_response = requests.get(steamspy_url)
        steamspy_response.raise_for_status()
        steamspy_data = steamspy_response.json()
        avg_playtime = steamspy_data.get("average_2weeks", 0) / 60.0

        time.sleep(1)
        return {
            "game_id": str(appid),
            "name": name,
            "player_count": player_count,
            "price": price,
            "avg_playtime": avg_playtime,
            "genres": genres,
            "timestamp": datetime.now().isoformat()
        }
    except (requests.RequestException, ValueError) as e:
        print(f"Error fetching data for {name}: {e}")
        return {
            "game_id": str(appid),
            "name": name,
            "player_count": 0,
            "price": "N/A",
            "avg_playtime": 0.0,
            "genres": "N/A",
            "timestamp": datetime.now().isoformat()
        }

@app.task
def fetch_game_data():
    top_games = fetch_top_games()
    game_data = []

    for appid, data in top_games.items():
        game_data.append(fetch_game_details(appid, data.get("name", "Unknown")))

    df = pd.DataFrame(game_data)
    print(df.head())

    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cursor = conn.cursor()

        for _, row in df.iterrows():
            try:
                cursor.execute("""
                    INSERT INTO game_stats (name, player_count, price, avg_playtime, genres, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    row["name"],
                    row["player_count"],
                    row["price"],
                    row["avg_playtime"],
                    row["genres"],
                    row["timestamp"]
                ))
                cursor.execute("""
                    INSERT INTO price_history (game_id, name, price, timestamp)
                    VALUES (%s, %s, %s, %s)
                """, (
                    row["game_id"],
                    row["name"],
                    row["price"],
                    row["timestamp"]
                ))
            except psycopg2.IntegrityError:
                print(f"Skipping duplicate entry for {row['name']}")
                conn.rollback()
                continue

        conn.commit()
        cursor.close()
        conn.close()
        print("Data inserted successfully")
    except psycopg2.Error as e:
        print(f"Database insertion error: {e}")

if __name__ == "__main__":
    fetch_game_data()