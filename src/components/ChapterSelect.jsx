import { CHAPTERS } from "../../shared/chapters.js";

export default function ChapterSelect({ progress, onSelect, onBack }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-xl mb-1" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600", textShadow: "0 0 30px rgba(255,214,0,0.25)" }}>
        STORY MODE
      </div>
      <div className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#888" }}>
        Six lessons with Sarge—trading, news, diversification, compounding, budgeting, and core vocab.
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {CHAPTERS.map((ch) => {
          const completed = progress.completed.includes(ch.id);
          const current = ch.id === progress.currentChapter;
          const locked = ch.id > progress.currentChapter && !completed;

          return (
            <button
              key={ch.id}
              onClick={() => !locked && onSelect(ch.id)}
              disabled={locked}
              className="rounded-xl p-5 text-left transition-all cursor-pointer border-2"
              style={{
                background: current ? "rgba(255,214,0,0.08)" : completed ? "rgba(118,255,3,0.05)" : "rgba(255,255,255,0.02)",
                borderColor: current ? "#FFD60066" : completed ? "#76FF0333" : "transparent",
                opacity: locked ? 0.4 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold"
                  style={{
                    background: completed ? "#76FF03" : current ? "#FFD600" : "#333",
                    color: completed || current ? "#0a0e1a" : "#666",
                    fontFamily: "var(--font-pixel)",
                    fontSize: "14px",
                  }}
                >
                  {completed ? "✓" : locked ? "🔒" : ch.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold" style={{ color: locked ? "#555" : "#fff", fontFamily: "var(--font-pixel)", fontSize: "11px" }}>
                    {ch.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: locked ? "#444" : "#888" }}>
                    {ch.subtitle}
                  </div>
                </div>
                {completed && <span className="text-sm">{ch.badge.icon}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {progress.completed.length === CHAPTERS.length && (
        <div className="mt-8 rounded-xl p-4" style={{ background: "rgba(118,255,3,0.08)", border: "1px solid #76FF0333" }}>
          <div className="text-xs mb-1" style={{ fontFamily: "var(--font-pixel)", color: "#76FF03" }}>ALL CHAPTERS COMPLETE</div>
          <div className="text-xs" style={{ color: "#aaa" }}>You're ready for multiplayer!</div>
        </div>
      )}

      <button onClick={onBack} className="mt-8 text-xs border-none bg-transparent cursor-pointer" style={{ color: "#444" }}>
        ← Back to home
      </button>
    </div>
  );
}
