"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Game {
  name: string;
  player_count: number;
  price: string;
  avg_playtime: number;
  genres: string;
  timestamp: string;
}

interface Genre {
  genre: string;
  total_players: number;
}

interface PlaytimeInsight {
  name: string;
  avg_playtime: number;
  genres: string;
}

interface AffordableGame {
  name: string;
  player_count: number;
  price: string;
  genres: string;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [playtimeInsights, setPlaytimeInsights] = useState<PlaytimeInsight[]>([]);
  const [affordableGames, setAffordableGames] = useState<AffordableGame[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const genreParam = selectedGenre ? `&genre=${encodeURIComponent(selectedGenre)}` : "";
        const [gamesResponse, genresResponse, playtimeResponse, affordableResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/trending-games?limit=10${genreParam}`),
          axios.get("http://127.0.0.1:8000/top-genres"),
          axios.get("http://127.0.0.1:8000/playtime-insights"),
          axios.get("http://127.0.0.1:8000/affordable-games"),
        ]);
        setGames(gamesResponse.data);
        setGenres(genresResponse.data);
        setPlaytimeInsights(playtimeResponse.data);
        setAffordableGames(affordableResponse.data);
      } catch (error: unknown) {
        setError("Failed to fetch dashboard data");
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [selectedGenre]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Gaming Intelligence Platform</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <label htmlFor="genre-filter" className="mr-2">Filter by Genre:</label>
        <select
          id="genre-filter"
          className="border border-gray-300 rounded p-1"
          value={selectedGenre || ""}
          onChange={(e) => setSelectedGenre(e.target.value || null)}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.genre} value={g.genre}>{g.genre}</option>
          ))}
        </select>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Trending Games</h2>
      {games.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Rank</th>
              <th className="border border-gray-300 p-2">Game</th>
              <th className="border border-gray-300 p-2">Players</th>
              <th className="border border-gray-300 p-2">Price</th>
              <th className="border border-gray-300 p-2">Price Status</th>
              <th className="border border-gray-300 p-2">Avg. Playtime (hrs)</th>
              <th className="border border-gray-300 p-2">Genres</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr key={game.name} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2">{game.name}</td>
                <td className="border border-gray-300 p-2">{game.player_count.toLocaleString()}</td>
                <td className="border border-gray-300 p-2">{game.price}</td>
                <td className="border border-gray-300 p-2">Stable</td>
                <td className="border border-gray-300 p-2">{game.avg_playtime.toFixed(1)}</td>
                <td className="border border-gray-300 p-2">{game.genres}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading games...</p>
      )}

      <h2 className="text-2xl font-semibold mb-2">Top Genres by Popularity</h2>
      {genres.length > 0 ? (
        <div className="h-64 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genres}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="genre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_players" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>Loading genres...</p>
      )}

      <h2 className="text-2xl font-semibold mb-2">Playtime Insights</h2>
      {playtimeInsights.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Game</th>
              <th className="border border-gray-300 p-2">Avg. Playtime (hrs)</th>
              <th className="border border-gray-300 p-2">Genres</th>
            </tr>
          </thead>
          <tbody>
            {playtimeInsights.map((game) => (
              <tr key={game.name} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{game.name}</td>
                <td className="border border-gray-300 p-2">{game.avg_playtime.toFixed(1)}</td>
                <td className="border border-gray-300 p-2">{game.genres}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading playtime insights...</p>
      )}

      <h2 className="text-2xl font-semibold mb-2">Most Affordable Trending Games</h2>
      {affordableGames.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Game</th>
              <th className="border border-gray-300 p-2">Players</th>
              <th className="border border-gray-300 p-2">Price</th>
              <th className="border border-gray-300 p-2">Genres</th>
            </tr>
          </thead>
          <tbody>
            {affordableGames.map((game) => (
              <tr key={game.name} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{game.name}</td>
                <td className="border border-gray-300 p-2">{game.player_count.toLocaleString()}</td>
                <td className="border border-gray-300 p-2">{game.price}</td>
                <td className="border border-gray-300 p-2">{game.genres}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading affordable games...</p>
      )}
    </div>
  );
}