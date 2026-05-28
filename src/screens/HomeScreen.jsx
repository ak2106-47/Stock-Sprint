import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArcadeTitle from "../components/ArcadeTitle.jsx";

/** Looped on the landing page; fades out when leaving via Story / Host / Join. */
const HOME_LOOP_MP3 = "end_of_line.mp3";
const HOME_LOOP_VOLUME = 0.18;
const LEAVE_FADE_MS = 750;

const STEPS = [
  { num: "1", icon: "📰", title: "Watch the News", desc: "Headlines move prices. Bullish news pushes stocks up, bearish drags them down." },
  { num: "2", icon: "💰", title: "Buy & Sell", desc: "Tap a stock, pick a quantity, and trade. You start with $10,000 in cash." },
  { num: "3", icon: "📈", title: "Grow Your Portfolio", desc: "Buy low, sell high. Your total portfolio value is cash + holdings." },
  { num: "4", icon: "🏆", title: "Beat the Clock", desc: "When time runs out, highest portfolio wins. Earn badges along the way." },
];

/** Public folder URL (correct when app is hosted under a subpath). */
function publicAsset(filename) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
  const name = filename.replace(/^\//, "");
  const encoded = name.split("/").map((seg) => encodeURIComponent(seg)).join("/");
  return base ? `${base}/${encoded}` : `/${encoded}`;
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const introRef = useRef(null);
  const fadeRafRef = useRef(null);
  const [isMusicOn, setIsMusicOn] = useState(false);

  /** Toggle music on/off — doubles as the user gesture that unlocks playback. */
  const toggleMusic = useCallback((e) => {
    e.stopPropagation();
    const el = introRef.current;
    if (!el) return;

    if (isMusicOn) {
      el.pause();
      setIsMusicOn(false);
    } else {
      el.volume = HOME_LOOP_VOLUME;
      el.play().catch(() => {});
      setIsMusicOn(true);
    }
  }, [isMusicOn]);

  useEffect(() => {
    const el = introRef.current;
    if (!el) return undefined;
    el.volume = HOME_LOOP_VOLUME;

    return () => {
      if (fadeRafRef.current != null) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }
      el.pause();
      el.currentTime = 0;
      el.volume = HOME_LOOP_VOLUME;
    };
  }, []);

  const navigateAfterFade = useCallback(
    (to) => {
      const el = introRef.current;
      if (!el || !isMusicOn || el.paused) {
        navigate(to);
        return;
      }
      const startVol = el.volume;
      if (startVol < 0.02) {
        navigate(to);
        return;
      }
      if (fadeRafRef.current != null) {
        cancelAnimationFrame(fadeRafRef.current);
      }
      const started = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - started) / LEAVE_FADE_MS);
        el.volume = startVol * (1 - t);
        if (t < 1) {
          fadeRafRef.current = requestAnimationFrame(tick);
        } else {
          fadeRafRef.current = null;
          el.pause();
          el.currentTime = 0;
          el.volume = HOME_LOOP_VOLUME;
          navigate(to);
        }
      };
      fadeRafRef.current = requestAnimationFrame(tick);
    },
    [navigate, isMusicOn],
  );

  return (
    <div className="relative isolate min-h-dvh">
      <audio ref={introRef} src={publicAsset(HOME_LOOP_MP3)} preload="auto" playsInline loop />
      <img
        src={publicAsset("moneyflynobackground.gif")}
        alt=""
        className="home-money-fly"
        width={36}
        height={36}
        decoding="async"
        loading="eager"
      />
      <img
        src={publicAsset("breifcasenobg.gif")}
        alt=""
        className="home-briefcase-fly"
        width={36}
        height={36}
        decoding="async"
        loading="eager"
      />
      <img
        src={publicAsset("coffee.gif")}
        alt=""
        className="home-coffee-fly"
        width={36}
        height={36}
        decoding="async"
        loading="eager"
      />
      <img
        src={publicAsset("coinnobg.gif")}
        alt=""
        className="home-coin-fly"
        width={122}
        height={122}
        decoding="async"
        loading="eager"
      />
      <button
        type="button"
        onClick={toggleMusic}
        className="fixed bottom-4 right-4 z-30 rounded-lg px-2.5 py-1.5 text-xs border cursor-pointer select-none"
        style={{
          fontFamily: "var(--font-pixel)",
          background: "rgba(10,14,26,0.85)",
          borderColor: "rgba(255,214,0,0.35)",
          color: "#FFD600",
          boxShadow: "0 0 12px rgba(255,214,0,0.12)",
        }}
        aria-label={isMusicOn ? "Mute music" : "Unmute music"}
        aria-pressed={isMusicOn}
      >
        {isMusicOn ? "MUSIC ON" : "MUSIC OFF"}
      </button>

      <div className="relative z-20">
        {/* First viewport: hero vertically centered (shifted down), “HOW TO PLAY” only at bottom */}
        <section className="min-h-dvh flex flex-col px-6">
          <div
            className="flex-1 flex flex-col items-center justify-center text-center min-h-0
              pt-[clamp(3rem,12vh,6rem)] pb-4"
          >
            <h1 className="mb-2 mt-0 text-center font-normal">
              <ArcadeTitle>STOCK SPRINT</ArcadeTitle>
            </h1>

            <div className="flex items-end justify-center gap-1.5 my-1.5">
              <span className="text-base select-none opacity-90 pb-0.5" aria-hidden>💰</span>
              <img
                src={publicAsset("rocket-to-the-moon.gif")}
                alt=""
                width={30}
                height={30}
                className="shrink-0 w-auto"
                style={{
                  width: "30px",
                  maxWidth: "30px",
                  height: "auto",
                  imageRendering: "pixelated",
                  filter: "drop-shadow(0 0 4px rgba(255,214,0,0.18))",
                }}
                decoding="async"
              />
              <span className="text-base select-none opacity-90 pb-0.5" aria-hidden>💸</span>
            </div>

            <p className="text-sm max-w-md leading-relaxed mb-4" style={{ color: "#aaa" }}>
              Learn to trade through Sarge's story
              <br />
              — then compete with friends.
            </p>

            <div className="w-full max-w-[min(100%,280px)] mx-auto mb-6 flex justify-center">
              <img
                src={publicAsset("output-onlinegiftools.gif")}
                alt="Stock Sprint"
                className="w-full h-auto max-h-[min(40vh,220px)] object-contain"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(255,214,0,0.15))",
                }}
                decoding="async"
                loading="eager"
              />
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button
                onClick={() => navigate("/story")}
                className="btn-pixel w-full py-4 px-6 font-bold text-lg cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
                style={{
                  fontFamily: "var(--font-pixel)",
                  background: "#76FF03",
                  color: "#0a0e1a",
                  boxShadow: "0 0 30px rgba(118,255,3,0.25)",
                }}
              >
                STORY MODE
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/host")}
                  className="btn-pixel flex-1 py-4 px-6 font-bold text-base cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    background: "#FFD600",
                    color: "#0a0e1a",
                    boxShadow: "0 0 30px rgba(255,214,0,0.25)",
                  }}
                >
                  HOST
                </button>
                <button
                  onClick={() => navigate("/play")}
                  className="btn-pixel flex-1 py-4 px-6 font-bold text-base cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    background: "#00E5FF",
                    color: "#0a0e1a",
                    boxShadow: "0 0 30px rgba(0,229,255,0.25)",
                  }}
                >
                  JOIN
                </button>
              </div>
            </div>

            <p className="text-xs mt-6 mb-2 max-w-md" style={{ color: "#444" }}>
              Story mode teaches the basics. Multiplayer lets you compete.
            </p>
          </div>

          <div className="shrink-0 w-full text-center py-6 border-t border-white/[0.06]">
            <div
              className="text-xs tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}
            >
              HOW TO PLAY
            </div>
          </div>
        </section>

        {/* Below the fold — steps + tip */}
        <section className="px-6 pb-20 max-w-lg mx-auto w-full text-center">
          <div className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="flex gap-3 text-left rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(255,214,0,0.08)",
                    border: "1px solid rgba(255,214,0,0.15)",
                    fontFamily: "var(--font-pixel)",
                    color: "#FFD600",
                    fontSize: 12,
                  }}
                >
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base">{step.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: "#ddd" }}>
                      {step.title}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#777" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs leading-relaxed mt-6 text-left" style={{ color: "#555" }}>
            <span style={{ color: "#76FF03" }}>TIP:</span> Read the news feed — it tells you which stocks are about to move and in which direction.
          </p>
        </section>
      </div>
    </div>
  );
}
