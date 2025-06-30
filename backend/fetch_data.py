import requests
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime
import time
import re
import feedparser
from googleapiclient.discovery import build

load_dotenv()
STEAM_API_KEY = os.getenv("STEAM_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
TWITCH_CLIENT_ID = os.getenv("TWITCH_CLIENT_ID")
TWITCH_CLIENT_SECRET = os.getenv("TWITCH_CLIENT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")

def get_twitch_access_token():
    try:
        response = requests.post(
            "https://id.twitch.tv/oauth2/token",
            data={
                "client_id": TWITCH_CLIENT_ID,
                "client_secret": TWITCH_CLIENT_SECRET,
                "grant_type": "client_credentials"
            }
        )
        response.raise_for_status()
        return response.json().get("access_token")
    except requests.RequestException as e:
        print(f"Error getting Twitch access token: {e}")
        return None

def clean_price(price_str):
    if not price_str or price_str.lower() in ["free", "0", "$0", "$0.00"]:
        return "Free"
    match = re.match(r'^\$?(\d*\.?\d{0,2})$', price_str.replace('$', ''))
    if match:
        return f"${match.group(1)}"
    print(f"Invalid price format: {price_str}, defaulting to 'N/A'")
    return "N/A"

def fetch_steam_games():
    try:
        url = "https://steamspy.com/api.php?request=top100in2weeks"
        response = requests.get(url)
        response.raise_for_status()
        games = response.json()
        print(f"Fetched {len(games)} Steam games")
        game_data = []
        for appid, data in list(games.items())[:5]:  # Limit to 5 for testing
            game = fetch_steam_game_details(appid, data.get("name", "Unknown"))
            game["source"] = "Steam"
            game_data.append(game)
        return game_data
    except requests.RequestException as e:
        print(f"Error fetching Steam games: {e}")
        return []

def fetch_steam_game_details(appid, name):
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
        print(f"Error fetching Steam data for {name}: {e}")
        return {
            "game_id": str(appid),
            "name": name,
            "player_count": 0,
            "price": "N/A",
            "avg_playtime": 0.0,
            "genres": "N/A",
            "timestamp": datetime.now().isoformat()
        }

def fetch_itch_games():
    try:
        url = "https://itch.io/games/top-rated.rss"
        feed = feedparser.parse(url)
        game_data = []
        for entry in feed.entries[:3]:  # Limit to 3 for testing
            game_id = entry.link.split("/")[-1]
            name = entry.title
            price = "Free"
            genres = ", ".join([tag.term for tag in entry.tags if tag.term]) or "Indie"
            game_data.append({
                "game_id": f"itch_{game_id}",
                "name": name,
                "player_count": 0,
                "price": price,
                "avg_playtime": 0.0,
                "genres": genres,
                "timestamp": datetime.now().isoformat(),
                "source": "itch.io"
            })
        print(f"Fetched {len(game_data)} itch.io games")
        return game_data
    except Exception as e:
        print(f"Error fetching itch.io games: {e}")
        return []

def fetch_youtube_creators(game_name):
    try:
        youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        search_response = youtube.search().list(
            q=game_name,
            part="snippet",
            type="channel",
            maxResults=2  # Limit for testing
        ).execute()
        creator_data = []
        for item in search_response.get("items", []):
            channel_id = item["snippet"]["channelId"]
            channel_response = youtube.channels().list(
                part="snippet,statistics",
                id=channel_id
            ).execute()
            channel = channel_response.get("items", [{}])[0]
            stats = channel.get("statistics", {})
            creator_data.append({
                "creator_id": channel_id,
                "name": channel.get("snippet", {}).get("title", "Unknown"),
                "platform": "YouTube",
                "subscriber_count": int(stats.get("subscriberCount", 0)),
                "video_count": int(stats.get("videoCount", 0)),
                "total_views": int(stats.get("viewCount", 0)),
                "game_name": game_name,
                "timestamp": datetime.now().isoformat()
            })
        print(f"Fetched {len(creator_data)} YouTube creators for {game_name}")
        return creator_data
    except Exception as e:
        print(f"Error fetching YouTube creators for {game_name}: {e}")
        return []

def fetch_twitch_creators(game_name):
        try:
            access_token = get_twitch_access_token()
            if not access_token:
                return []
            headers = {
                "Client-ID": TWITCH_CLIENT_ID,
                "Authorization": f"Bearer {access_token}"
            }
            game_response = requests.get(
                f"https://api.twitch.tv/helix/games?name={game_name}",
                headers=headers
            )
            game_response.raise_for_status()
            game_id = game_response.json().get("data", [{}])[0].get("id")
            if not game_id:
                return []

            streams_response = requests.get(
                f"https://api.twitch.tv/helix/streams?game_id={game_id}&first=2",
                headers=headers
            )
            streams_response.raise_for_status()
            creator_data = []
            for stream in streams_response.json().get("data", []):
                user_id = stream["user_id"]
                user_response = requests.get(
                    f"https://api.twitch.tv/helix/users?id={user_id}",
                    headers=headers
                )
                user_response.raise_for_status()
                user = user_response.json().get("data", [{}])[0]
                videos_response = requests.get(
                    f"https://api.twitch.tv/helix/videos?user_id={user_id}&first=10",  # Increased to 10
                    headers=headers
                )
                videos_response.raise_for_status()
                videos = videos_response.json().get("data", [])
                total_views = sum(v["view_count"] for v in videos) if videos else 0
                creator_data.append({
                    "creator_id": user_id,
                    "name": user.get("display_name", "Unknown"),
                    "platform": "Twitch",
                    "subscriber_count": 0,
                    "video_count": len(videos),
                    "total_views": total_views,
                    "game_name": game_name,
                    "timestamp": datetime.now().isoformat()
                })
            print(f"Fetched {len(creator_data)} Twitch creators for {game_name}")
            return creator_data
        except requests.RequestException as e:
            print(f"Error fetching Twitch creators for {game_name}: {e}")
            return []

def fetch_game_data():
    steam_games = fetch_steam_games()
    itch_games = fetch_itch_games()
    game_data = steam_games + itch_games
    df_games = pd.DataFrame(game_data)
    print("Games DataFrame:")
    print(df_games.head())

    creator_data = []
    for game in df_games["name"].head(2):  # Limit to 2 games for testing
        creator_data.extend(fetch_youtube_creators(game))
        creator_data.extend(fetch_twitch_creators(game))
        time.sleep(1)

    df_creators = pd.DataFrame(creator_data)
    print("Creators DataFrame:")
    print(df_creators.head())

    try:
        conn = psycopg2.connect(SUPABASE_URL)
        cursor = conn.cursor()

        for _, row in df_games.iterrows():
            try:
                cursor.execute("""
                    INSERT INTO game_stats (name, player_count, price, avg_playtime, genres, timestamp, source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    row["name"],
                    row["player_count"],
                    row["price"],
                    row["avg_playtime"],
                    row["genres"],
                    row["timestamp"],
                    row["source"]
                ))
                cursor.execute("""
                    INSERT INTO price_history (game_id, name, price, timestamp, source)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    row["game_id"],
                    row["name"],
                    row["price"],
                    row["timestamp"],
                    row["source"]
                ))
            except psycopg2.IntegrityError:
                print(f"Skipping duplicate game entry for {row['name']}")
                conn.rollback()
                continue

        for _, row in df_creators.iterrows():
            try:
                cursor.execute("""
                    INSERT INTO creator_stats (creator_id, name, platform, subscriber_count, video_count, total_views, game_name, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    row["creator_id"],
                    row["name"],
                    row["platform"],
                    row["subscriber_count"],
                    row["video_count"],
                    row["total_views"],
                    row["game_name"],
                    row["timestamp"]
                ))
            except psycopg2.IntegrityError:
                print(f"Skipping duplicate creator entry for {row['name']}")
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