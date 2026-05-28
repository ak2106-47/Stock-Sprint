export default function Leaderboard({ entries, highlightId, compact = false }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="w-full">
      {entries.map((entry, i) => {
        const isMe = entry.id === highlightId;
        const isPositive = entry.returnPct >= 0;
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all"
            style={{
              background: isMe ? "rgba(255,214,0,0.1)" : "rgba(255,255,255,0.03)",
              border: isMe ? "1px solid rgba(255,214,0,0.3)" : "1px solid transparent",
            }}
          >
            <span className="w-8 text-center font-bold text-sm shrink-0">
              {medal || `#${entry.rank}`}
            </span>
            <span
              className="flex-1 font-semibold truncate"
              style={{ fontSize: compact ? 13 : 15 }}
            >
              {entry.name}
            </span>
            {!compact && (
              <span className="text-xs text-[#aaa] hidden sm:inline">
                {entry.trades} trades
              </span>
            )}
            <span
              className="font-bold text-sm tabular-nums"
              style={{ color: isPositive ? "#76FF03" : "#FF3D71" }}
            >
              {isPositive ? "+" : ""}
              {entry.returnPct}%
            </span>
            {!compact && (
              <span className="text-xs font-semibold tabular-nums w-24 text-right hidden sm:inline">
                ${entry.value?.toLocaleString()}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
