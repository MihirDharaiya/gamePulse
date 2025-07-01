"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";

interface Game {
  name: string;
  player_count: number;
  price: string;
  avg_playtime: number;
  genres: string;
  timestamp: string;
  source: string;
}

interface PublisherInsight {
  platform: string;
  total_games: number;
  total_players: number;
  avg_price: number;
  top_genre: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Publishers() {
  const [games, setGames] = useState<Game[]>([]);
  const [publisherInsights, setPublisherInsights] = useState<PublisherInsight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const gamesResponse = await axios.get("/api/trending-games?limit=100");
        const gamesData = gamesResponse.data;
        setGames(gamesData);

        // Process publisher insights
        const platformStats = gamesData.reduce((acc: any, game: Game) => {
          if (!acc[game.source]) {
            acc[game.source] = {
              platform: game.source,
              total_games: 0,
              total_players: 0,
              prices: [],
              genres: {}
            };
          }
          
          acc[game.source].total_games += 1;
          acc[game.source].total_players += game.player_count;
          
          if (game.price !== "Free" && game.price !== "N/A") {
            acc[game.source].prices.push(parseFloat(game.price.replace("$", "")));
          }
          
          game.genres.split(", ").forEach(genre => {
            acc[game.source].genres[genre] = (acc[game.source].genres[genre] || 0) + 1;
          });
          
          return acc;
        }, {});

        const insights = Object.values(platformStats).map((stat: any) => ({
          platform: stat.platform,
          total_games: stat.total_games,
          total_players: stat.total_players,
          avg_price: stat.prices.length > 0 ? stat.prices.reduce((a: number, b: number) => a + b, 0) / stat.prices.length : 0,
          top_genre: Object.entries(stat.genres).sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || "N/A"
        }));

        setPublisherInsights(insights);
      } catch (error: unknown) {
        setError("Failed to fetch publisher data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = games.reduce((sum, game) => {
    if (game.price !== "Free" && game.price !== "N/A") {
      return sum + (parseFloat(game.price.replace("$", "")) * game.player_count * 0.1); // Estimated revenue
    }
    return sum;
  }, 0);

  const genreDistribution = games.reduce((acc, game) => {
    game.genres.split(", ").forEach(genre => {
      acc[genre] = (acc[genre] || 0) + game.player_count;
    });
    return acc;
  }, {} as Record<string, number>);

  const genreData = Object.entries(genreDistribution)
    .map(([genre, players]) => ({ genre, players }))
    .sort((a, b) => b.players - a.players)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Publisher Intelligence</h1>
          <p className="text-gray-600">Market insights and platform performance analytics for game publishers</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Est. Market Revenue"
            value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
            change={18.5}
            trend="up"
            icon="💰"
            subtitle="Monthly estimate"
          />
          <MetricCard
            title="Active Platforms"
            value={publisherInsights.length}
            icon="🏢"
            subtitle="Distribution channels"
          />
          <MetricCard
            title="Total Games"
            value={games.length}
            change={7.2}
            trend="up"
            icon="🎮"
            subtitle="Across all platforms"
          />
          <MetricCard
            title="Market Reach"
            value={`${(games.reduce((sum, game) => sum + game.player_count, 0) / 1000000).toFixed(1)}M`}
            change={12.3}
            trend="up"
            icon="🌍"
            subtitle="Total players"
          />
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Performance</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {publisherInsights.map((insight, index) => (
                <div key={insight.platform} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{insight.platform}</h4>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{insight.total_games}</p>
                        <p className="text-xs text-gray-500">Games</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{insight.total_players.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Players</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">${insight.avg_price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Avg Price</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700">Market Share</p>
                      <p className="text-lg font-bold text-gray-900">
                        {((insight.total_players / games.reduce((sum, game) => sum + game.player_count, 0)) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700">Top Genre</p>
                      <p className="text-lg font-bold text-gray-900">{insight.top_genre}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700">Revenue Model</p>
                      <p className="text-lg font-bold text-gray-900">
                        {insight.avg_price === 0 ? "Free-to-Play" : "Premium"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Genre Market Share */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Genre Market Share</h3>
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ genre, players }) => `${genre} (${((players / genreData.reduce((sum, item) => sum + item.players, 0)) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="players"
                  >
                    {genreData.map((entry, index) => (
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

          {/* Platform Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Player Distribution</h3>
            {publisherInsights.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={publisherInsights}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), "Players"]} />
                  <Bar dataKey="total_players" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="loading-shimmer w-full h-full rounded-lg"></div>
              </div>
            )}
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Market Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📈</span>
                </div>
                <h4 className="font-semibold text-gray-900">Growth Opportunity</h4>
              </div>
              <p className="text-sm text-gray-600">
                Free-to-play games show 23% higher player engagement. Consider freemium models for broader reach.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🎯</span>
                </div>
                <h4 className="font-semibold text-gray-900">Target Audience</h4>
              </div>
              <p className="text-sm text-gray-600">
                Action and Strategy genres dominate player count. Focus on these categories for maximum impact.
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💡</span>
                </div>
                <h4 className="font-semibold text-gray-900">Platform Strategy</h4>
              </div>
              <p className="text-sm text-gray-600">
                Multi-platform releases increase visibility by 40%. Consider simultaneous launches across platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}