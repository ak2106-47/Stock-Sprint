export default function Timer({ timeLeft, total = 60 }) {
  const pct = (timeLeft / total) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 rounded-full overflow-hidden flex-1"
        style={{ background: "rgba(255,255,255,0.1)", minWidth: 80 }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: isUrgent
              ? "#FF3D71"
              : `linear-gradient(90deg, #76FF03, #00E5FF)`,
          }}
        />
      </div>
      <span
        className="font-bold text-sm tabular-nums"
        style={{
          color: isUrgent ? "#FF3D71" : "#aaa",
          fontFamily: "var(--font-mono)",
        }}
      >
        {timeLeft}s
      </span>
    </div>
  );
}
