"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
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

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const genreParam = selectedGenre ? `&genre=${encodeURIComponent(selectedGenre)}` : "";
        const sourceParam = selectedSource ? `&source=${encodeURIComponent(selectedSource)}` : "";
        const [gamesResponse, genresResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/trending-games?limit=50${genreParam}${sourceParam}`),
          axios.get("http://127.0.0.1:8000/top-genres")
        ]);
        setGames(gamesResponse.data);
        setFilteredGames(gamesResponse.data);
        setGenres(genresResponse.data);
      } catch (error: unknown) {
        setError("Failed to fetch games data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGenre, selectedSource]);

  useEffect(() => {
    let filtered = games;

    if (searchQuery) {
      filtered = filtered.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (priceFilter) {
      filtered = filtered.filter((game) => {
        switch (priceFilter) {
          case "free":
            return game.price === "Free";
          case "under10":
            return game.price !== "Free" && game.price !== "N/A" && 
                   parseFloat(game.price.replace("$", "")) <= 10;
          case "under20":
            return game.price !== "Free" && game.price !== "N/A" && 
                   parseFloat(game.price.replace("$", "")) <= 20;
          case "premium":
            return game.price !== "Free" && game.price !== "N/A" && 
                   parseFloat(game.price.replace("$", "")) > 20;
          default:
            return true;
        }
      });
    }

    setFilteredGames(filtered);
  }, [searchQuery, games, priceFilter]);

  const totalGames = games.length;
  const freeGames = games.filter(game => game.price === "Free").length;
  const avgPrice = games
    .filter(game => game.price !== "Free" && game.price !== "N/A")
    .reduce((sum, game) => sum + parseFloat(game.price.replace("$", "")), 0) / 
    games.filter(game => game.price !== "Free" && game.price !== "N/A").length || 0;
  const totalPlayers = games.reduce((sum, game) => sum + game.player_count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into trending games across platforms</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Games"
            value={totalGames}
            change={5.2}
            trend="up"
            icon="🎮"
            subtitle="Tracked games"
          />
          <MetricCard
            title="Free Games"
            value={`${((freeGames / totalGames) * 100).toFixed(0)}%`}
            change={2.1}
            trend="up"
            icon="🆓"
            subtitle={`${freeGames} free games`}
          />
          <MetricCard
            title="Avg. Price"
            value={`$${avgPrice.toFixed(2)}`}
            change={-1.5}
            trend="down"
            icon="💰"
            subtitle="Paid games only"
          />
          <MetricCard
            title="Total Players"
            value={totalPlayers.toLocaleString()}
            change={12.8}
            trend="up"
            icon="👥"
            subtitle="Active players"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={priceFilter || ""}
                onChange={(e) => setPriceFilter(e.target.value || null)}
              >
                <option value="">All Prices</option>
                <option value="free">Free</option>
                <option value="under10">Under $10</option>
                <option value="under20">Under $20</option>
                <option value="premium">Premium ($20+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Count Distribution</h3>
          {filteredGames.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredGames.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => [value.toLocaleString(), "Players"]} />
                <Bar dataKey="player_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="loading-shimmer w-full h-full rounded-lg"></div>
            </div>
          )}
        </div>

        {/* Games Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Games</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredGames.length} of {games.length} games
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
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
      </div>
    </div>
  );
}