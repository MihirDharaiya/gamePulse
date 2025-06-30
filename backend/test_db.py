
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")

try:
    conn = psycopg2.connect(SUPABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM game_stats LIMIT 1")
    print("Table Schema:", cursor.description)
    print("Sample Row:", cursor.fetchall())
    cursor.close()
    conn.close()
except psycopg2.Error as e:
    print(f"Database connection error: {e}")
    print(f"Error details: {e.pgcode} - {e.pgerror}")
