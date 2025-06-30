interface CreatorCardProps {
  creator: {
    creator_id: string;
    name: string;
    platform: string;
    subscriber_count: number;
    video_count: number;
    total_views: number;
    game_name: string;
    engagement_score: number;
  };
  rank: number;
}

export default function CreatorCard({ creator, rank }: CreatorCardProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube": return "📺";
      case "twitch": return "🎥";
      default: return "📱";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube": return "text-red-600 bg-red-100";
      case "twitch": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            #{rank}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{creator.name}</h3>
            <p className="text-sm text-gray-600">{creator.game_name}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPlatformColor(creator.platform)}`}>
          <span>{getPlatformIcon(creator.platform)}</span>
          <span>{creator.platform}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Subscribers</p>
          <p className="text-lg font-semibold text-gray-900">{formatNumber(creator.subscriber_count)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Videos</p>
          <p className="text-lg font-semibold text-gray-900">{creator.video_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Views</p>
          <p className="text-lg font-semibold text-gray-900">{formatNumber(creator.total_views)}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Engagement Score</p>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                style={{ width: `${Math.min((creator.engagement_score / 10000) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-900">{formatNumber(creator.engagement_score)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}