interface GameCardProps {
  game: {
    name: string;
    player_count: number;
    price: string;
    avg_playtime: number;
    genres: string;
    source: string;
  };
  rank: number;
}

export default function GameCard({ game, rank }: GameCardProps) {
  const getPlatformIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "steam": return "🎮";
      case "itch.io": return "🎨";
      default: return "🎯";
    }
  };

  const getPriceColor = (price: string) => {
    if (price === "Free") return "text-green-600 bg-green-100";
    if (price.includes("$") && parseFloat(price.replace("$", "")) <= 10) return "text-blue-600 bg-blue-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            #{rank}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{game.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm">{getPlatformIcon(game.source)}</span>
              <span className="text-sm text-gray-600">{game.source}</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPriceColor(game.price)}`}>
          {game.price}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Players</p>
          <p className="text-lg font-semibold text-gray-900">{game.player_count.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg. Playtime</p>
          <p className="text-lg font-semibold text-gray-900">{game.avg_playtime.toFixed(1)}h</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Genres</p>
        <div className="flex flex-wrap gap-1">
          {game.genres.split(", ").slice(0, 3).map((genre, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              {genre}
            </span>
          ))}
          {game.genres.split(", ").length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
              +{game.genres.split(", ").length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}