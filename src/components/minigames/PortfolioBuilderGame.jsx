import { useState, useCallback } from "react";

export default function PortfolioBuilderGame({ config, onComplete }) {
  const [allocations, setAllocations] = useState(config.stocks.map(() => Math.floor(config.budget / config.stocks.length)));
  const [crashResult, setCrashResult] = useState(null);

  const remaining = config.budget - allocations.reduce((sum, a) => sum + a, 0);

  const handleSlider = (idx, raw) => {
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    const newAlloc = [...allocations];
    const oldVal = newAlloc[idx];
    const diff = value - oldVal;
    if (remaining - diff < 0 && diff > 0) return;
    newAlloc[idx] = value;
    setAllocations(newAlloc);
  };

  const handleSimulate = () => {
    if (remaining !== 0) return;

    const crashIdx = config.crashStockIdx;
    const results = allocations.map((amount, i) => {
      if (i === crashIdx) {
        return { before: amount, after: Math.max(0, Math.round(amount * (1 + config.crashPct / 100))), change: config.crashPct };
      }
      const change = Math.round((Math.random() * 10) - 2);
      return { before: amount, after: Math.round(amount * (1 + change / 100)), change };
    });
    const totalBefore = results.reduce((s, r) => s + r.before, 0);
    const totalAfter = results.reduce((s, r) => s + r.after, 0);
    const diversified = allocations.filter((a) => a > 0).length >= 3;

    setCrashResult({ results, totalBefore, totalAfter, diversified });
  };

  const handleContinue = useCallback(() => {
    onComplete?.(crashResult?.diversified ?? false);
  }, [onComplete, crashResult]);

  const handleContinueKey = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleContinue();
    }
  }, [handleContinue]);

  if (crashResult) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto animate-slide-up">
        <div className="text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FF3D71" }}>
          💥 MARKET CRASH!
        </div>

        <div className="w-full flex flex-col gap-2">
          {config.stocks.map((stock, i) => (
            <div key={stock.symbol} className="flex items-center gap-3 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="font-bold text-sm w-12" style={{ color: stock.color }}>{stock.symbol}</span>
              <span className="text-sm" style={{ color: "#888" }}>${crashResult.results[i].before}</span>
              <span style={{ color: "#555" }}>→</span>
              <span className="text-sm font-bold" style={{ color: crashResult.results[i].change >= 0 ? "#76FF03" : "#FF3D71" }}>
                ${crashResult.results[i].after}
              </span>
              <span className="text-xs ml-auto" style={{ color: crashResult.results[i].change >= 0 ? "#76FF03" : "#FF3D71" }}>
                {crashResult.results[i].change >= 0 ? "+" : ""}{crashResult.results[i].change}%
              </span>
            </div>
          ))}
        </div>

        <div className="text-center animate-slide-up">
          <div className="text-lg font-bold mb-2" style={{ color: crashResult.diversified ? "#76FF03" : "#FF3D71" }}>
            ${crashResult.totalBefore} → ${crashResult.totalAfter}
          </div>
          <div className="text-sm" style={{ color: "#aaa" }}>
            {crashResult.diversified ? config.diversifiedMessage : config.concentratedMessage}
          </div>
        </div>

        <button
          type="button"
          autoFocus
          onClick={handleContinue}
          onKeyDown={handleContinueKey}
          className="rounded-xl py-3 px-8 font-bold text-sm cursor-pointer border-none tracking-wider transition-transform hover:scale-105 mt-2"
          style={{ fontFamily: "var(--font-pixel)", background: "#FFD600", color: "#0a0e1a" }}
        >
          CONTINUE ▶
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className="text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
        MINI-GAME: BUILD YOUR PORTFOLIO
      </div>
      <div className="text-sm text-center" style={{ color: "#aaa" }}>{config.instructions}</div>

      <div className="text-sm font-bold" style={{ color: remaining === 0 ? "#76FF03" : "#FFD600" }}>
        ${remaining} remaining
      </div>

      <div className="w-full flex flex-col gap-4">
        {config.stocks.map((stock, i) => (
          <div key={stock.symbol}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm" style={{ color: stock.color }}>{stock.symbol}</span>
              <span className="text-xs" style={{ color: "#888" }}>{stock.risk}</span>
              <span className="text-sm font-bold" style={{ color: "#fff" }}>${allocations[i]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={config.budget}
              value={allocations[i]}
              onChange={(e) => handleSlider(i, e.target.value)}
              onInput={(e) => handleSlider(i, e.target.value)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: stock.color, background: "rgba(255,255,255,0.1)" }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSimulate}
        disabled={remaining !== 0}
        className="rounded-xl py-4 px-12 font-bold text-base cursor-pointer border-none tracking-wider transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          fontFamily: "var(--font-pixel)",
          background: remaining === 0 ? "#FFD600" : "#333",
          color: "#0a0e1a",
          opacity: remaining === 0 ? 1 : 0.5,
        }}
      >
        SIMULATE CRASH 💥
      </button>
    </div>
  );
}
