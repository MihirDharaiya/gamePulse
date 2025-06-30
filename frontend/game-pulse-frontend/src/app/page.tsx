"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

interface Game {
  name: string;
  player_count: number;
  price: string;
  avg_playtime: number;
  genres: string;
  timestamp: string;
  source: string;
}

interface Genre {
  genre: string;
  total_players: number;
}

interface PlaytimeInsight {
  name: string;
  avg_playtime: number;
  genres: string;
  source: string;
}

interface AffordableGame {
  name: string;
  player_count: number;
  price: string;
  genres: string;
  source: string;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [playtimeInsights, setPlaytimeInsights] = useState<PlaytimeInsight[]>([]);
  const [affordableGames, setAffordableGames] = useState<AffordableGame[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const genreParam = selectedGenre ? `&genre=${encodeURIComponent(selectedGenre)}` : "";
        const sourceParam = selectedSource ? `&source=${encodeURIComponent(selectedSource)}` : "";
        const [gamesResponse, genresResponse, playtimeResponse, affordableResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/trending-games?limit=10${genreParam}${sourceParam}`),
          axios.get("http://127.0.0.1:8000/top-genres"),
          axios.get("http://127.0.0.1:8000/playtime-insights"),
          axios.get("http://127.0.0.1:8000/affordable-games")
        ]);
        setGames(gamesResponse.data);
        setFilteredGames(gamesResponse.data);
        setGenres(genresResponse.data);
        setPlaytimeInsights(playtimeResponse.data);
        setAffordableGames(affordableResponse.data);
      } catch (error: unknown) {
        setError("Failed to fetch dashboard data");
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [selectedGenre, selectedSource]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredGames(
        games.filter((game) =>
          game.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredGames(games);
    }
  }, [searchQuery, games]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Gaming Intelligence Platform
          </h1>
          <Link href="/creators" className="text-blue-500 hover:underline">
            View Top Creators
          </Link>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search games..."
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedGenre || ""}
            onChange={(e) => setSelectedGenre(e.target.value || null)}
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.genre} value={g.genre}>
                {g.genre}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSource || ""}
            onChange={(e) => setSelectedSource(e.target.value || null)}
          >
            <option value="">All Platforms</option>
            <option value="Steam">Steam</option>
            <option value="itch.io">itch.io</option>
          </select>
        </div>

        {/* Trending Games */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Trending Games</h2>
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredGames.map((game, index) => (
              <div
                key={`${game.source}-${game.name}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-gray-800">
                  #{index + 1} {game.name}
                </h3>
                <p className="text-gray-600">Platform: {game.source}</p>
                <p className="text-gray-600">Players: {game.player_count.toLocaleString()}</p>
                <p className="text-gray-600">Price: {game.price}</p>
                <p className="text-gray-600">Price Status: Stable</p>
                <p className="text-gray-600">Avg. Playtime: {game.avg_playtime.toFixed(1)} hrs</p>
                <p className="text-gray-600">Genres: {game.genres}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Loading games...</p>
        )}

        {/* Top Genres Chart */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Top Genres by Popularity</h2>
        {genres.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 mb-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genres}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="genre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_players" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-600">Loading genres...</p>
        )}

        {/* Playtime Insights */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Playtime Insights</h2>
        {playtimeInsights.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {playtimeInsights.map((game) => (
              <div
                key={`${game.source}-${game.name}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-gray-800">{game.name}</h3>
                <p className="text-gray-600">Platform: {game.source}</p>
                <p className="text-gray-600">Avg. Playtime: {game.avg_playtime.toFixed(1)} hrs</p>
                <p className="text-gray-600">Genres: {game.genres}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Loading playtime insights...</p>
        )}

        {/* Affordable Games */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Most Affordable Trending Games</h2>
        {affordableGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {affordableGames.map((game) => (
              <div
                key={`${game.source}-${game.name}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-gray-800">{game.name}</h3>
                <p className="text-gray-600">Platform: {game.source}</p>
                <p className="text-gray-600">Players: {game.player_count.toLocaleString()}</p>
                <p className="text-gray-600">Price: {game.price}</p>
                <p className="text-gray-600">Genres: {game.genres}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Loading affordable games...</p>
        )}
      </div>
    </div>
  );
}