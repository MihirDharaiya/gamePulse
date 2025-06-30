import requests
from dotenv import load_dotenv
import os
from googleapiclient.discovery import build
import feedparser

load_dotenv()

def test_steam():
    url = "https://steamspy.com/api.php?request=top100in2weeks"
    try:
        response = requests.get(url)
        response.raise_for_status()
        print("SteamSpy API: Success")
    except Exception as e:
        print(f"SteamSpy API: Failed - {e}")

def test_youtube():
    try:
        youtube = build("youtube", "v3", developerKey=os.getenv("YOUTUBE_API_KEY"))
        youtube.search().list(q="Dota 2", part="snippet", type="channel", maxResults=1).execute()
        print("YouTube API: Success")
    except Exception as e:
        print(f"YouTube API: Failed - {e}")

def test_twitch():
    try:
        response = requests.post(
            "https://id.twitch.tv/oauth2/token",
            data={
                "client_id": os.getenv("TWITCH_CLIENT_ID"),
                "client_secret": os.getenv("TWITCH_CLIENT_SECRET"),
                "grant_type": "client_credentials"
            }
        )
        response.raise_for_status()
        print("Twitch API: Success")
    except Exception as e:
        print(f"Twitch API: Failed - {e}")

def test_itch():
    try:
        feed = feedparser.parse("https://itch.io/games/top-rated.rss")
        print("itch.io RSS: Success")
    except Exception as e:
        print(f"itch.io RSS: Failed - {e}")

def test_supabase():
    try:
        import psycopg2
        conn = psycopg2.connect(os.getenv("SUPABASE_URL"))
        conn.close()
        print("Supabase: Success")
    except Exception as e:
        print(f"Supabase: Failed - {e}")

if __name__ == "__main__":
    test_steam()
    test_youtube()
    test_twitch()
    test_itch()
    test_supabase()