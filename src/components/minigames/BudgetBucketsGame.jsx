import { useState, useCallback, useMemo } from "react";

export default function BudgetBucketsGame({ config, onComplete }) {
  const buckets = config.buckets ?? [
    { id: "needs", label: "Needs (rent, food, transport)", emoji: "🏠", color: "#00E5FF" },
    { id: "grow", label: "Save & invest", emoji: "📈", color: "#76FF03" },
    { id: "flex", label: "Fun & flexible", emoji: "🎮", color: "#FFD600" },
  ];
  const budget = config.budget ?? 100;

  const equal = Math.floor(budget / buckets.length);
  const [alloc, setAlloc] = useState(() => buckets.map((_, i) => (i === 0 ? budget - equal * (buckets.length - 1) : equal)));

  const total = useMemo(() => alloc.reduce((s, a) => s + a, 0), [alloc]);
  const remaining = budget - total;

  const setBucket = (idx, raw) => {
    const v = Number(raw);
    if (!Number.isFinite(v) || v < 0) return;
    const next = [...alloc];
    const o = next[idx];
    const delta = v - o;
    if (remaining - delta < 0 && delta > 0) return;
    next[idx] = v;
    setAlloc(next);
  };

  const balanced = remaining === 0;

  const handleDone = useCallback(() => {
    onComplete?.(true);
  }, [onComplete]);

  const handleKey = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleDone();
      }
    },
    [handleDone],
  );

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5 mx-auto animate-slide-up px-2">
      <div className="text-xs tracking-wider text-center" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
        {config.title ?? "MINI-GAME: PAY YOURSELF FIRST"}
      </div>
      <p className="text-sm text-center m-0" style={{ color: "#aaa" }}>
        {config.instructions ??
          "Split 100% of a pretend paycheck. Many plans foreground needs, then savings, then fun—tweak and see what feels honest for you."}
      </p>

      <div
        className="w-full flex justify-between text-xs rounded-lg px-3 py-2"
        style={{ background: "rgba(255,255,255,0.05)", color: balanced ? "#76FF03" : "#FF9100" }}
      >
        <span>Total assigned</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>
          {total}/{budget}%
        </span>
      </div>

      <div className="w-full flex flex-col gap-4">
        {buckets.map((b, i) => (
          <div key={b.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${b.color}33` }}>
            <div className="flex justify-between text-sm mb-2" style={{ color: "#ddd" }}>
              <span>
                {b.emoji} {b.label}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", color: b.color }}>{alloc[i]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={budget}
              step={5}
              value={alloc[i]}
              onChange={(e) => setBucket(i, e.target.value)}
              className="w-full"
              style={{ accentColor: b.color }}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-center m-0 leading-relaxed" style={{ color: "#666" }}>
        {config.footnote ?? "Real life has irregular bills—this is a habit sketch, not a strict rule."}
      </p>

      <button
        type="button"
        autoFocus
        onClick={handleDone}
        onKeyDown={handleKey}
        disabled={!balanced}
        className="rounded-xl py-3 px-8 font-bold text-sm cursor-pointer border-none tracking-wider transition-transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{ fontFamily: "var(--font-pixel)", background: "#FFD600", color: "#0a0e1a" }}
      >
        CONTINUE ▶
      </button>
      {!balanced && (
        <span className="text-[10px] text-center" style={{ color: "#666" }}>
          Assign exactly {budget}% to continue (adjust sliders).
        </span>
      )}
    </div>
  );
}
