import { useState, useMemo, useCallback } from "react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TermMatchGame({ config, onComplete }) {
  const pairs = config.pairs ?? [];

  const defOrder = useMemo(() => shuffle(pairs.map((p) => ({ id: p.id, text: p.definition }))), [pairs]);

  const [selectedTerm, setSelectedTerm] = useState(null);
  const [shake, setShake] = useState(false);
  const [matched, setMatched] = useState(() => new Set());

  const termClick = (id) => {
    if (matched.has(id)) return;
    setSelectedTerm(id);
  };

  const defClick = (defId) => {
    if (matched.has(defId)) return;
    if (selectedTerm == null) return;
    if (selectedTerm === defId) {
      setMatched((prev) => {
        const next = new Set(prev).add(defId);
        if (next.size >= pairs.length) {
          setTimeout(() => onComplete?.(true), 350);
        }
        return next;
      });
      setSelectedTerm(null);
      return;
    }
    setShake(true);
    setSelectedTerm(null);
    setTimeout(() => setShake(false), 400);
  };

  const handleSkip = useCallback(() => onComplete?.(true), [onComplete]);

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4 mx-auto animate-slide-up px-2">
      <div className="text-xs tracking-wider text-center" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
        {config.title ?? "MINI-GAME: MATCH THE TERMS"}
      </div>
      <p className="text-sm text-center m-0" style={{ color: "#aaa" }}>
        {config.instructions ?? "Tap a term, then its meaning. Clear all pairs to finish."}
      </p>

      <div className={`grid w-full gap-4 sm:grid-cols-2 ${shake ? "opacity-90" : ""}`}>
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold mb-1" style={{ fontFamily: "var(--font-pixel)", color: "#00E5FF" }}>
            TERMS
          </div>
          {pairs.map((p) => {
            const done = matched.has(p.id);
            const sel = selectedTerm === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={done}
                onClick={() => termClick(p.id)}
                className="rounded-lg border-2 px-3 py-2.5 text-left text-sm transition-all cursor-pointer disabled:opacity-35 disabled:cursor-default"
                style={{
                  borderColor: done ? "#76FF03" : sel ? "#FFD600" : "rgba(255,255,255,0.15)",
                  background: done ? "rgba(118,255,3,0.1)" : sel ? "rgba(255,214,0,0.08)" : "rgba(0,0,0,0.25)",
                  color: "#e8e8e8",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {p.term}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold mb-1" style={{ fontFamily: "var(--font-pixel)", color: "#FF9100" }}>
            MEANINGS
          </div>
          {defOrder.map((d) => {
            const done = matched.has(d.id);
            return (
              <button
                key={`${d.id}-def`}
                type="button"
                disabled={done}
                onClick={() => defClick(d.id)}
                className="rounded-lg border-2 px-3 py-2.5 text-left text-xs leading-snug transition-all cursor-pointer disabled:opacity-35 disabled:cursor-default sm:text-sm"
                style={{
                  borderColor: done ? "#76FF03" : "rgba(255,255,255,0.15)",
                  background: done ? "rgba(118,255,3,0.1)" : "rgba(0,0,0,0.25)",
                  color: "#ccc",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {d.text}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSkip}
        className="text-[10px] border-none bg-transparent cursor-pointer underline"
        style={{ color: "#555" }}
      >
        Skip · I’ve got it
      </button>
    </div>
  );
}
