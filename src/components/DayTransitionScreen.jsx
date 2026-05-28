import { useState, useEffect, useRef } from "react";
import Leaderboard from "./Leaderboard.jsx";

const TRANSITION_MS_DAY1 = 20000;
const TRANSITION_MS = 10000;

const DAY_TITLE_STYLE = {
  fontFamily: "var(--font-pixel)",
  color: "#FFD600",
  fontSize: "clamp(40px, 10vw, 80px)",
  textShadow:
    "3px 4px 0 rgba(160,70,0,0.94), -2px -1.5px 0 rgba(0,229,255,0.28), 0 0 40px rgba(255,214,0,0.65), 0 0 80px rgba(255,214,0,0.25), 0 6px 0 rgba(0,0,0,0.55)",
  letterSpacing: "0.05em",
};

const HOW_TO_STEPS = [
  { icon: "📊", title: "Pick a stock", desc: "Tap any of the 4 stock cards to select it. Each stock has different risk and speed." },
  { icon: "💰", title: "Buy shares", desc: "Use the quantity buttons to set how many shares, then press BUY. You start with $10,000." },
  { icon: "📰", title: "Watch the news", desc: "Breaking news moves prices fast. Bullish news pumps a stock; bearish news tanks it." },
  { icon: "💸", title: "Sell to cash out", desc: "Hit SELL when you're up to lock in profits. Prices can reverse at any moment." },
  { icon: "🏆", title: "Highest portfolio wins", desc: "The player with the most total value (cash + shares) when time runs out wins." },
];

// ── Shared progress bar with Sarge ──────────────────────────────────────
function ProgressBar({ durationMs }) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      const pct = Math.min((Date.now() - startRef.current) / durationMs, 1);
      setProgress(pct);
      if (pct >= 1) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [durationMs]);

  const pct = Math.round(progress * 100);

  return (
    <div className="shrink-0 px-8 pb-8 pt-4">
      <div
        className="text-center text-xs mb-3 tracking-widest"
        style={{ fontFamily: "var(--font-pixel)", color: "#555" }}
      >
        {pct < 100 ? "STARTING SOON..." : "LOADING..."}
      </div>

      <div
        className="relative h-5 rounded-full overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,214,0,0.2)",
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #FFD600 0%, #FF9100 100%)",
            boxShadow: "0 0 12px rgba(255,214,0,0.5)",
            transition: "width 0.05s linear",
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
          style={{ fontFamily: "var(--font-pixel)", color: pct > 48 ? "#0a0e1a" : "#FFD600" }}
        >
          {pct}%
        </div>
      </div>
    </div>
  );
}

// ── Day 1: how-to guide ───────────────────────────────────────────────────────
function Day1Content() {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <div
        className="text-xs text-center tracking-widest mb-1"
        style={{ fontFamily: "var(--font-pixel)", color: "#aaa" }}
      >
        HOW TO PLAY
      </div>
      {HOW_TO_STEPS.map((step, i) => (
        <div
          key={i}
          className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,214,0,0.12)",
          }}
        >
          <span className="text-2xl shrink-0 mt-0.5">{step.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold mb-0.5" style={{ color: "#FFD600" }}>
              {i + 1}. {step.title}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#888" }}>
              {step.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Day 2+: leaderboard ───────────────────────────────────────────────────────
function DayLeaderboardContent({ leaderboard, highlightId }) {
  return (
    <div className="flex-1 min-h-0 overflow-auto px-6 pb-2">
      <div className="max-w-lg mx-auto">
        {leaderboard.length > 0 ? (
          <Leaderboard entries={leaderboard} highlightId={highlightId} />
        ) : (
          <div className="text-center text-sm pt-6" style={{ color: "#444" }}>
            No players yet
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DayTransitionScreen({ dayNumber, leaderboard, highlightId }) {
  const isDay1 = dayNumber === 1;
  const displayDay = isDay1 ? 1 : dayNumber - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: "#0a0e1a" }}
    >
      {/* Title */}
      <div className="flex items-center justify-center pt-8 pb-4 shrink-0">
        <div style={DAY_TITLE_STYLE}>DAY {displayDay}</div>
      </div>

      {/* Content fills remaining vertical space */}
      {isDay1 ? (
        <div className="flex-1 min-h-0 overflow-auto px-6 pb-2">
          <div className="max-w-lg mx-auto">
            <Day1Content />
          </div>
        </div>
      ) : (
        <DayLeaderboardContent leaderboard={leaderboard} highlightId={highlightId} />
      )}

      {/* Progress bar — always shown, duration differs */}
      <ProgressBar durationMs={isDay1 ? TRANSITION_MS_DAY1 : TRANSITION_MS} />
    </div>
  );
}
