import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { useSocket } from "../hooks/useSocket.js";
import { STOCKS, DEFAULT_DURATION } from "../../shared/constants.js";
import BadgeChip from "../components/BadgeChip.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import Timer from "../components/Timer.jsx";
import NewsTicker from "../components/NewsTicker.jsx";
import DurationPicker from "../components/DurationPicker.jsx";
import UrgencyOverlay from "../components/UrgencyOverlay.jsx";
import DayTransitionScreen from "../components/DayTransitionScreen.jsx";
import useSoundEngine from "../hooks/useSoundEngine.js";
import { useNewsAnnouncer } from "../hooks/useNewsAnnouncer.js";

export default function HostPage() {
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  const sound = useSoundEngine();

  const [phase, setPhase] = useState("creating");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [market, setMarket] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [results, setResults] = useState(null);
  const [newsEvents, setNewsEvents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dayScreen, setDayScreen] = useState(null);
  const [dayWarning, setDayWarning] = useState(false);
  const hostCreateDoneRef = useRef(false);

  useNewsAnnouncer(phase === "playing" ? newsEvents : [], phase === "playing");

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/play/${roomCode}` : "";

  useEffect(() => {
    if (!socket || !connected) return;

    if (!hostCreateDoneRef.current) {
      hostCreateDoneRef.current = true;
      socket.emit("host:create", (res) => {
        if (res.ok) { setRoomCode(res.code); setPhase("lobby"); }
      });
    }

    socket.on("lobby:update", ({ players: p }) => setPlayers(p));

    socket.on("game:start", ({ market: m, duration: d }) => {
      setMarket(m);
      if (d) setDuration(d);
      setPhase("playing");
      sound.bell();
      sound.startAmbient();
    });

    socket.on("game:day", ({ dayNumber, leaderboard: lb }) => {
      setDayWarning(false);
      setDayScreen({ dayNumber, leaderboard: lb });
    });

    socket.on("game:dayWarning", () => {
      setDayWarning(true);
      setTimeout(() => setDayWarning(false), 5000);
    });

    socket.on("game:tick", (data) => {
      setDayScreen(null);
      setMarket({ prices: data.prices, histories: data.histories, timeLeft: data.timeLeft });
      setLeaderboard(data.leaderboard);
    });

    socket.on("game:news", (event) => {
      setNewsEvents((prev) => [...prev.slice(-9), event]);
      sound.news();
    });

    socket.on("game:timer", ({ timeLeft: t }) => setTimeLeft(t));

    socket.on("game:end", ({ results: r }) => {
      setResults(r);
      setPhase("results");
      sound.stopAmbient();
      sound.bell();
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.3 }, colors: ["#FFD600", "#76FF03", "#00E5FF", "#FF3D71"] });
    });

    return () => {
      socket.off("lobby:update");
      socket.off("game:start");
      socket.off("game:day");
      socket.off("game:dayWarning");
      socket.off("game:tick");
      socket.off("game:news");
      socket.off("game:timer");
      socket.off("game:end");
    };
  }, [socket, connected, sound]);

  const handleDurationChange = useCallback((seconds) => {
    sound.unlock();
    setDuration(seconds);
    if (socket) socket.emit("host:setDuration", { seconds }, () => {});
  }, [socket, sound]);

  const startGame = useCallback(() => {
    sound.unlock();
    if (!socket) return;
    socket.emit("host:start", (res) => {
      if (!res.ok) alert(res.error);
    });
  }, [socket, sound]);

  const kickPlayer = useCallback(
    (playerId) => {
      if (!socket) return;
      socket.emit("host:kick", { playerId }, () => {});
    },
    [socket],
  );

  // ─── Lobby ────────────────────────────────────────────────
  if (phase === "creating" || phase === "lobby") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 text-center">
        {phase === "creating" ? (
          <div style={{ color: "#aaa" }}>Creating room...</div>
        ) : (
          <>
            <div className="text-sm mb-2 tracking-widest" style={{ fontFamily: "var(--font-pixel)", color: "#aaa" }}>
              ROOM CODE
            </div>
            <div
              className="text-6xl sm:text-8xl font-bold mb-6 tracking-[0.2em] animate-pulse-border border-4 rounded-2xl px-8 py-4"
              style={{ fontFamily: "var(--font-pixel)", color: "#FFD600", textShadow: "0 0 40px rgba(255,214,0,0.3)", borderColor: "rgba(255,214,0,0.3)" }}
            >
              {roomCode}
            </div>

            <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              <QRCodeSVG value={joinUrl} size={160} bgColor="transparent" fgColor="#ffffff" />
              <div className="text-xs mt-2" style={{ color: "#666" }}>Scan to join</div>
            </div>

            <div className="text-xs mb-4" style={{ color: "#666" }}>{joinUrl}</div>

            <div className="mb-6">
              <DurationPicker value={duration} onChange={handleDurationChange} />
            </div>

            <div className="mb-6 w-full max-w-md">
              <div className="text-sm mb-3" style={{ color: "#aaa" }}>Players ({players.length})</div>
              {players.length === 0 ? (
                <div className="text-sm py-4" style={{ color: "#444" }}>Waiting for players to join...</div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((p, i) => (
                    <div
                      key={p.id}
                      className="animate-slide-up rounded-lg px-4 py-2 flex items-center gap-2"
                      style={{ background: "rgba(255,255,255,0.06)", animationDelay: `${i * 0.05}s` }}
                    >
                      <span className="font-semibold text-sm">{p.name}</span>
                      <button onClick={() => kickPlayer(p.id)} className="text-xs cursor-pointer border-none bg-transparent" style={{ color: "#FF3D71" }} title="Kick player">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={startGame} disabled={players.length === 0}
              className="btn-pixel py-4 px-12 font-bold text-lg cursor-pointer border-none tracking-wider transition-transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-pixel)", background: "#76FF03", color: "#0a0e1a", boxShadow: players.length > 0 ? "0 0 30px rgba(118,255,3,0.25)" : "none" }}
            >
              START GAME
            </button>
            {phase === "lobby" && (
              <audio 
                src="/tron_score.mp3" 
                autoPlay 
                loop 
                playsInline
                ref={(el) => {
                  if (el) el.play().catch(() => {});
                }}
              />
            )}
          </>
        )}
      </div>
    );
  }

  // ─── Playing ──────────────────────────────────────────────
  if (phase === "playing") {
    const histories = market?.histories || STOCKS.map((s) => [s.basePrice]);

    if (dayScreen) {
      return <DayTransitionScreen dayNumber={dayScreen.dayNumber} leaderboard={dayScreen.leaderboard} />;
    }

    return (
      <div className="h-dvh max-h-dvh overflow-hidden flex flex-col px-4 py-3 gap-2 w-full max-w-none box-border">
        <UrgencyOverlay timeLeft={timeLeft} />

        {/* Day-end flash overlay */}
        {dayWarning && (
          <div
            className="pointer-events-none fixed inset-0 z-40"
            style={{
              boxShadow: "inset 0 0 140px 60px rgba(255,30,60,0.45)",
              animation: "urgency-pulse 0.7s ease-in-out infinite",
            }}
          />
        )}

        {/* Day-end alert — bottom right */}
        {dayWarning && (
          <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3"
            style={{
              background: "rgba(20,5,8,0.95)",
              border: "2px solid #FF3D71",
              boxShadow: "0 0 24px rgba(255,61,113,0.5)",
              animation: "urgency-pulse 0.7s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div className="text-xs font-bold tracking-widest" style={{ fontFamily: "var(--font-pixel)", color: "#FF3D71" }}>
                DAY ENDING
              </div>
              <div className="text-xs" style={{ color: "#aaa" }}>Next day in 5 seconds</div>
            </div>
          </div>
        )}

        <div className="shrink-0 flex justify-between items-center flex-wrap gap-2">
          <div className="text-sm tracking-widest" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
            STOCK SPRINT
          </div>
          <div className="text-xs px-3 py-1 rounded-md" style={{ background: "rgba(255,214,0,0.1)", color: "#FFD600" }}>
            ROOM: {roomCode}
          </div>
        </div>

        <div className="shrink-0">
          <Timer timeLeft={timeLeft} total={duration} />
        </div>

        <div className="shrink-0 flex flex-wrap gap-2">
          {STOCKS.map((stock, i) => {
            const price = market?.prices?.[i];
            return (
              <div
                key={stock.symbol}
                className="flex-[1_1_0%] text-center rounded-lg py-3 text-sm lg:text-xl font-mono font-bold tabular-nums"
                style={{ background: "rgba(255,255,255,0.05)", color: stock.color, border: `1px solid ${stock.color}44` }}
              >
                {stock.symbol} <span className="opacity-70 ml-2">${price != null ? price.toFixed(2) : "—"}</span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
          <div className="flex-[6] min-h-0 flex flex-col">
            <NewsTicker events={newsEvents} expanded />
          </div>

          <div className="flex-[4] min-h-0 overflow-auto">
            <Leaderboard entries={leaderboard} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Results ──────────────────────────────────────────────
  if (phase === "results" && results) {
    const winner = results[0];
    const gradeColor = { S: "#FFD600", A: "#76FF03", B: "#00E5FF", C: "#fff", D: "#FF9100", F: "#FF3D71" };

    return (
      <div className="min-h-dvh flex flex-col items-center px-6 py-12">
        <div className="text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-pixel)", color: "#aaa" }}>
          MARKET CLOSED
        </div>

        {winner && (
          <div className="text-center mb-8 animate-slide-up">
            <div className="text-5xl mb-2">👑</div>
            <div className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
              {winner.name}
            </div>
            <div className="text-xl font-bold" style={{ color: winner.returnPct >= 0 ? "#76FF03" : "#FF3D71" }}>
              {winner.returnPct >= 0 ? "+" : ""}{winner.returnPct}% return
            </div>
            <div className="text-sm mt-1" style={{ color: "#aaa" }}>${winner.value?.toLocaleString()}</div>
          </div>
        )}

        <div className="w-full max-w-lg mb-8">
          <div className="text-xs mb-3 tracking-widest" style={{ fontFamily: "var(--font-pixel)", color: "#aaa" }}>
            FINAL RANKINGS
          </div>
          {results.map((r, i) => (
            <div
              key={r.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 animate-slide-up"
              style={{
                background: i === 0 ? "rgba(255,214,0,0.1)" : "rgba(255,255,255,0.04)",
                border: i === 0 ? "1px solid rgba(255,214,0,0.3)" : "1px solid transparent",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <span className="text-lg w-8 text-center">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${r.rank}`}
              </span>
              <span className="flex-1 font-semibold">{r.name}</span>
              <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-pixel)", color: gradeColor[r.grade] || "#fff" }}>
                {r.grade}
              </span>
              <span className="font-bold text-sm w-16 text-right" style={{ color: r.returnPct >= 0 ? "#76FF03" : "#FF3D71" }}>
                {r.returnPct >= 0 ? "+" : ""}{r.returnPct}%
              </span>
            </div>
          ))}
        </div>

        {winner?.badges?.length > 0 && (
          <div className="mb-8 text-center">
            <div className="text-xs mb-2" style={{ fontFamily: "var(--font-pixel)", color: "#666" }}>WINNER BADGES</div>
            <div className="flex gap-2 flex-wrap justify-center">
              {winner.badges.map((b) => (
                <BadgeChip key={b.id} badge={b} />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="btn-pixel py-3 px-8 font-bold text-sm cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
          style={{ fontFamily: "var(--font-pixel)", background: "#FFD600", color: "#0a0e1a" }}
        >
          NEW GAME
        </button>
      </div>
    );
  }

  return null;
}
