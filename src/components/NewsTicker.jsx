import { STOCKS } from "../../shared/constants.js";
import { NEWS_SENTIMENT_STYLES } from "./newsTheme.js";

export default function NewsTicker({ events, expanded = false }) {

  if (!events || events.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div
          className="text-[10px] mb-2 shrink-0 tracking-[0.18em] flex items-center gap-2"
          style={{ fontFamily: "var(--font-pixel)", color: "#5a6578" }}
        >
          <span aria-hidden>{"\u250c"}</span>
          <span>MARKET WIRE</span>
          <span aria-hidden>{"\u2510"}</span>
        </div>
        <div
          className="news-ticker-frame flex min-h-0 flex-1 items-center justify-center px-3 py-4"
          style={{
            background: "linear-gradient(180deg, rgba(6,10,18,0.9) 0%, rgba(8,14,24,0.95) 100%)",
            border: "3px double rgba(90, 101, 120, 0.45)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
            minHeight: 96,
          }}
        >
          <span className="text-xs tracking-wide text-center" style={{ color: "#4a5568", fontFamily: "var(--font-mono)" }}>
            Awaiting tickertape...
          </span>
        </div>
      </div>
    );
  }

  // Newest first: reverse so latest appears at top
  const displayed = events.slice(expanded ? -6 : -4).slice().reverse();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col min-w-0">
      <div
        className={`text-[10px] mb-2 shrink-0 tracking-[0.18em] flex items-center gap-2 ${expanded ? "lg:text-sm lg:mb-4" : ""}`}
        style={{ fontFamily: "var(--font-pixel)", color: "#7a8498" }}
      >
        <span aria-hidden className="text-[#FFD600]">{"\u25c6"}</span>
        <span>MARKET WIRE</span>
        <span className={`tracking-widest ml-auto opacity-70 ${expanded ? "text-xs" : "text-[9px]"}`}>TELETEXT</span>
      </div>
      <div
        className={`news-ticker-frame flex min-h-0 flex-1 flex-col overflow-y-auto ${expanded ? "gap-4 px-4 py-6" : "gap-2 px-1.5 py-2"}`}
        style={{
          background: "linear-gradient(180deg, rgba(5,9,16,0.92) 0%, rgba(7,12,22,0.98) 100%)",
          border: "3px double rgba(255, 214, 0, 0.22)",
          boxShadow: "inset 0 0 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {displayed.map((event, i) => {
          const s = NEWS_SENTIMENT_STYLES[event.sentiment] || NEWS_SENTIMENT_STYLES.neutral;
          const stockColor = event.stockIdx >= 0 ? STOCKS[event.stockIdx]?.color : "#FFD600";
          const isLatest = i === 0; // newest is now at top (index 0)

          return (
            <div
              key={`${event.headline}-${event.timestamp}`}
              className={`relative overflow-hidden transition-all ${expanded ? "px-6 py-5 rounded-lg" : "px-3 py-2.5"}`}
              style={{
                background: isLatest
                  ? `linear-gradient(90deg, ${s.bg} 0%, rgba(5,8,14,0.65) 100%)`
                  : "rgba(8,12,20,0.5)",
                border: `2px solid ${isLatest ? s.border : "rgba(80,90,110,0.35)"}`,
                opacity: isLatest ? 1 : 0.52,
                boxShadow: isLatest
                  ? `0 0 10px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.25)`
                  : "none",
                animation: isLatest ? "slide-up 0.4s ease-out" : undefined,
              }}
            >
              {isLatest && (
                <div
                  className="absolute inset-0 pointer-events-none news-crt-overlay opacity-[0.07] mix-blend-overlay"
                  aria-hidden
                />
              )}
              <div className={`relative flex items-center flex-wrap ${expanded ? "gap-4 mb-3" : "gap-2 mb-1.5"}`}>
                <span
                  className={`font-bold tabular-nums border ${expanded ? "text-sm px-3 py-1" : "text-[9px] px-1.5 py-0.5"}`}
                  style={{
                    fontFamily: "var(--font-pixel)",
                    borderColor: stockColor,
                    color: stockColor,
                    background: `${stockColor}14`,
                  }}
                >
                  {event.symbol}
                </span>
                <span
                  className={`font-bold tracking-[0.2em] ${expanded ? "text-sm" : "text-[8px]"}`}
                  style={{ fontFamily: "var(--font-pixel)", color: s.accent }}
                >
                  {s.icon} {s.label}
                </span>
                {isLatest && (
                  <span
                    className={`ml-auto flex items-center tracking-[0.25em] ${expanded ? "gap-2 text-[10px]" : "gap-1 text-[7px]"}`}
                    style={{ fontFamily: "var(--font-pixel)", color: "#5a6578" }}
                  >
                    <span className="news-live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.accent }} />
                    LIVE
                  </span>
                )}
              </div>
              <div
                className={`relative leading-snug tracking-wide ${expanded ? "text-xl md:text-2xl lg:text-3xl font-bold" : "text-[13px] font-semibold"}`}
                style={{
                  fontFamily: "var(--font-mono)",
                  color: isLatest ? s.color : "#5c6578",
                  textShadow: isLatest ? `0 0 6px ${s.glow}` : "none",
                }}
              >
                {event.headline}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
