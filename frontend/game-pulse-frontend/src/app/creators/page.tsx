"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from "recharts";
import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";
import CreatorCard from "@/components/CreatorCard";
import LoadingCard from "@/components/LoadingCard";

interface Creator {
  creator_id: string;
  name: string;
  platform: string;
  subscriber_count: number;
  video_count: number;
  total_views: number;
  game_name: string;
  engagement_score: number;
}

interface Game {
  name: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Creators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("total_views");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const platformParam = selectedPlatform ? `&platform=${encodeURIComponent(selectedPlatform)}` : "";
        const gameParam = selectedGame ? `&game_name=${encodeURIComponent(selectedGame)}` : "";
        const sortParam = sortBy ? `&sort_by=${encodeURIComponent(sortBy)}` : "";
        const [creatorsResponse, gamesResponse] = await Promise.all([
          axios.get(`/api/top-creators?limit=24${platformParam}${gameParam}${sortParam}`),
          axios.get("/api/trending-games?limit=50")
        ]);
        setCreators(creatorsResponse.data);
        setFilteredCreators(creatorsResponse.data);
        setGames(gamesResponse.data);
      } catch (error: unknown) {
        setError("Failed to fetch creators data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPlatform, selectedGame, sortBy]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredCreators(
        creators.filter((creator) =>
          creator.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredCreators(creators);
    }
  }, [searchQuery, creators]);

  const totalSubscribers = creators.reduce((sum, creator) => sum + creator.subscriber_count, 0);
  const totalViews = creators.reduce((sum, creator) => sum + creator.total_views, 0);
  const avgEngagement = creators.reduce((sum, creator) => sum + creator.engagement_score, 0) / creators.length || 0;
  const platformDistribution = creators.reduce((acc, creator) => {
    acc[creator.platform] = (acc[creator.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformData = Object.entries(platformDistribution).map(([platform, count]) => ({
    platform,
    count,
    percentage: (count / creators.length) * 100
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Creator Analytics</h1>
          <p className="text-gray-600">Discover top gaming content creators and their performance metrics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Subscribers"
            value={totalSubscribers.toLocaleString()}
            change={15.2}
            trend="up"
            icon="👥"
            subtitle="Across all creators"
          />
          <MetricCard
            title="Total Views"
            value={`${(totalViews / 1000000).toFixed(1)}M`}
            change={8.7}
            trend="up"
            icon="👁️"
            subtitle="Combined viewership"
          />
          <MetricCard
            title="Avg. Engagement"
            value={avgEngagement.toFixed(0)}
            change={-3.2}
            trend="down"
            icon="📊"
            subtitle="Views per content"
          />
          <MetricCard
            title="Creators Tracked"
            value={creators.length}
            icon="🎬"
            subtitle="Active creators"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Creators</label>
              <input
                type="text"
                placeholder="Search by creator name..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedPlatform || ""}
                onChange={(e) => setSelectedPlatform(e.target.value || null)}
              >
                <option value="">All Platforms</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitch">Twitch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Game</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedGame || ""}
                onChange={(e) => setSelectedGame(e.target.value || null)}
              >
                <option value="">All Games</option>
                {games.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="total_views">Total Views</option>
                <option value="subscriber_count">Subscribers</option>
                <option value="engagement_score">Engagement Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platform, percentage }) => `${platform} ${percentage.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Creators"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="loading-shimmer w-full h-full rounded-lg"></div>
              </div>
            )}
          </div>

          {/* Engagement vs Subscribers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement vs Subscribers</h3>
            {filteredCreators.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={filteredCreators}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subscriber_count" name="Subscribers" />
                  <YAxis dataKey="engagement_score" name="Engagement" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number, name: string) => [
                      name === "subscriber_count" ? value.toLocaleString() : value.toFixed(0),
                      name === "subscriber_count" ? "Subscribers" : "Engagement Score"
                    ]}
                  />
                  <Scatter dataKey="engagement_score" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="loading-shimmer w-full h-full rounded-lg"></div>
              </div>
            )}
          </div>
        </div>

        {/* Top Creators */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Top Content Creators</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredCreators.length} of {creators.length} creators
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : filteredCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCreators.map((creator, index) => (
                <CreatorCard 
                  key={`${creator.platform}-${creator.creator_id}`} 
                  creator={creator} 
                  rank={index + 1} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No creators found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}