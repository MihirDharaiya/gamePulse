"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";
import GameCard from "@/components/GameCard";
import LoadingCard from "@/components/LoadingCard";

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

// interface AffordableGame {
//   name: string;
//   player_count: number;
//   price: string;
//   genres: string;
//   source: string;
// }

// interface AffordableGame {
//   name: string;
//   player_count: number;
//   price: string;
//   genres: string;
//   source: string;
// }

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [playtimeInsights, setPlaytimeInsights] = useState<PlaytimeInsight[]>([]);
  // const [affordableGames, setAffordableGames] = useState<AffordableGame[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const genreParam = selectedGenre ? `&genre=${encodeURIComponent(selectedGenre)}` : "";
        const sourceParam = selectedSource ? `&source=${encodeURIComponent(selectedSource)}` : "";
        const [gamesResponse, genresResponse, playtimeResponse] = await Promise.all([
          axios.get(`/api/trending-games?limit=12${genreParam}${sourceParam}`),
          axios.get("/api/top-genres"),
          axios.get("/api/playtime-insights")
        ]);
        setGames(gamesResponse.data);
        setFilteredGames(gamesResponse.data);
        setGenres(genresResponse.data);
        setPlaytimeInsights(playtimeResponse.data);
      } catch (error: unknown) {
        setError("Failed to fetch dashboard data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
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

  const totalPlayers = games.reduce((sum, game) => sum + game.player_count, 0);
  const avgPlaytime = games.reduce((sum, game) => sum + game.avg_playtime, 0) / games.length || 0;
  const freeGames = games.filter(game => game.price === "Free").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gaming Intelligence Dashboard</h1>
          <p className="text-gray-600">Real-time insights into gaming trends, player behavior, and market dynamics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Active Players"
            value={totalPlayers.toLocaleString()}
            change={12.5}
            trend="up"
            icon="👥"
            subtitle="Across all platforms"
          />
          <MetricCard
            title="Average Playtime"
            value={`${avgPlaytime.toFixed(1)}h`}
            change={-2.3}
            trend="down"
            icon="⏱️"
            subtitle="Per game session"
          />
          <MetricCard
            title="Free Games"
            value={freeGames}
            change={8.7}
            trend="up"
            icon="🆓"
            subtitle="In trending list"
          />
          <MetricCard
            title="Platforms Tracked"
            value="2"
            icon="🎮"
            subtitle="Steam & itch.io"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Games</label>
              <input
                type="text"
                placeholder="Search by game name..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedSource || ""}
                onChange={(e) => setSelectedSource(e.target.value || null)}
              >
                <option value="">All Platforms</option>
                <option value="Steam">Steam</option>
                <option value="itch.io">itch.io</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Genre Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Genre Popularity</h3>
            {genres.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genres}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // label={({ genre, percent }) => `${genre} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_players"
                  >
                    {genres.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), "Players"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="loading-shimmer w-full h-full rounded-lg"></div>
              </div>
            )}
          </div>

          {/* Playtime Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Playtime Analysis</h3>
            {playtimeInsights.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={playtimeInsights}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)} hours`, "Avg. Playtime"]} />
                  <Bar dataKey="avg_playtime" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="loading-shimmer w-full h-full rounded-lg"></div>
              </div>
            )}
          </div>
        </div>

        {/* Trending Games */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trending Games</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredGames.length} of {games.length} games
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game, index) => (
                <GameCard key={`${game.source}-${game.name}`} game={game} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No games found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>

        {/* Affordable Games Section */}
        {/* <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Best Value Games</h2>
            <span className="text-sm text-gray-500">Free or under $10</span>
          </div>
          
          {affordableGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {affordableGames.map((game, index) => (
               <GameCard key={`${game.source}-${game.name}`} game={game} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          )} 
        </div> */}
      </div>
    </div>
  );
}