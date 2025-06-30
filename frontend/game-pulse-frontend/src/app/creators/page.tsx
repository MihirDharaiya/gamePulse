"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

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

export default function Creators() {
const [creators, setCreators] = useState<Creator[]>([]);
const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
const [games, setGames] = useState<Game[]>([]);
const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
const [selectedGame, setSelectedGame] = useState<string | null>(null);
const [sortBy, setSortBy] = useState<string>("total_views");
const [searchQuery, setSearchQuery] = useState<string>("");
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchData = async () => {
    try {
        const platformParam = selectedPlatform ? `&platform=${encodeURIComponent(selectedPlatform)}` : "";
        const gameParam = selectedGame ? `&game_name=${encodeURIComponent(selectedGame)}` : "";
        const sortParam = sortBy ? `&sort_by=${encodeURIComponent(sortBy)}` : "";
        const [creatorsResponse, gamesResponse] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/top-creators?limit=20${platformParam}${gameParam}${sortParam}`),
        axios.get("http://127.0.0.1:8000/trending-games?limit=50")
        ]);
        setCreators(creatorsResponse.data);
        setFilteredCreators(creatorsResponse.data);
        setGames(gamesResponse.data);
    } catch (error: unknown) {
        setError("Failed to fetch creators data");
        console.error("Error fetching data:", error);
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

return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
    <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Top Content Creators
        </h1>
        <Link href="/" className="text-blue-500 hover:underline">
            Back to Dashboard
        </Link>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
            type="text"
            placeholder="Search creators..."
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPlatform || ""}
            onChange={(e) => setSelectedPlatform(e.target.value || null)}
        >
            <option value="">All Platforms</option>
            <option value="YouTube">YouTube</option>
            <option value="Twitch">Twitch</option>
        </select>
        <select
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <select
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
        >
            <option value="total_views">Sort by Total Views</option>
            <option value="subscriber_count">Sort by Subscribers</option>
            <option value="engagement_score">Sort by Engagement Score</option>
        </select>
        </div>

        {/* Creators List */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Top Creators</h2>
        {filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredCreators.map((creator, index) => (
            <div
                key={`${creator.platform}-${creator.creator_id}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
            >
                <h3 className="text-lg font-bold text-gray-800">
                #{index + 1} {creator.name}
                </h3>
                <p className="text-gray-600">Platform: {creator.platform}</p>
                <p className="text-gray-600">Game: {creator.game_name}</p>
                <p className="text-gray-600">Subscribers: {creator.subscriber_count.toLocaleString()}</p>
                <p className="text-gray-600">Videos: {creator.video_count.toLocaleString()}</p>
                <p className="text-gray-600">Total Views: {creator.total_views.toLocaleString()}</p>
                <p className="text-gray-600 relative group">
                Engagement Score: {creator.engagement_score.toFixed(1)}
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-16">
                    Average views per video/stream
                </span>
                </p>
            </div>
            ))}
        </div>
        ) : (
        <p className="text-gray-600">Loading creators...</p>
        )}

        {/* Engagement Chart */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Creator Engagement by Platform</h2>
        {filteredCreators.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredCreators}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toFixed(1)} />
                <Bar dataKey="engagement_score" fill="#3b82f6" />
            </BarChart>
            </ResponsiveContainer>
        </div>
        ) : (
        <p className="text-gray-600">Loading engagement chart...</p>
        )}
    </div>
    </div>
);
}