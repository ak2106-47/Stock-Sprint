import { useState, useEffect, useRef } from "react";
import { STOCKS } from "../../shared/constants.js";
import { NEWS_SENTIMENT_STYLES } from "./newsTheme.js";

const DISPLAY_MS = 5000;

export default function NewsToast({ events }) {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (!events?.length) return;
    if (events.length === prevLenRef.current) return;
    prevLenRef.current = events.length;

    const latest = events[events.length - 1];
    setToast(latest);
    setVisible(true);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), DISPLAY_MS);

    return () => clearTimeout(timerRef.current);
  }, [events]);

  if (!toast || !visible) return null;

  const s = NEWS_SENTIMENT_STYLES[toast.sentiment] || NEWS_SENTIMENT_STYLES.neutral;
  const stockColor = toast.stockIdx >= 0 ? STOCKS[toast.stockIdx]?.color : "#FFD600";

  return (
    <div
      className="fixed top-3 left-3 right-3 z-50 pointer-events-none"
      style={{ animation: "slide-down 0.3s ease-out both" }}
    >
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3 mx-auto"
        style={{
          maxWidth: 520,
          background: `linear-gradient(90deg, ${s.bg} 0%, rgba(5,8,14,0.97) 100%)`,
          border: `2px solid ${s.border}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.7), 0 0 16px ${s.glow}`,
        }}
      >
        {/* Stock badge */}
        <div
          className="shrink-0 text-xs font-bold px-2 py-1 rounded mt-0.5"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "0.6rem",
            color: stockColor,
            background: `${stockColor}18`,
            border: `1px solid ${stockColor}55`,
          }}
        >
          {toast.symbol || STOCKS[toast.stockIdx]?.symbol}
        </div>

        <div className="flex-1 min-w-0">
          {/* Sentiment label */}
          <div
            className="text-xs font-bold tracking-widest mb-0.5"
            style={{ fontFamily: "var(--font-pixel)", color: s.accent, fontSize: "0.6rem" }}
          >
            {s.icon} {s.label}
          </div>
          {/* Headline */}
          <div
            className="text-sm font-semibold leading-snug"
            style={{ fontFamily: "var(--font-mono)", color: s.color }}
          >
            {toast.headline}
          </div>
        </div>
      </div>
    </div>
  );
}
