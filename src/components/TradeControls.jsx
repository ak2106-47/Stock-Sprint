import { useState } from "react";
import { STOCKS } from "../../shared/constants.js";

export default function TradeControls({ selectedStock, price, cash, onTrade, disabled }) {
  const [qty, setQty] = useState(1);
  const stock = STOCKS[selectedStock];
  const maxBuy = Math.floor((cash || 0) / (price || 1));
  const cost = (price || 0) * qty;

  const handleTrade = (type) => {
    if (disabled) return;
    onTrade({ stockIdx: selectedStock, qty, type });
  };

  const qtyPresets = [1, 5, 10, 25];

  return (
    <div className="rounded-xl p-3 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs" style={{ color: "#aaa" }}>
          QTY:
        </span>
        {qtyPresets.map((q) => (
          <button
            key={q}
            onClick={() => setQty(q)}
            disabled={disabled}
            className="rounded-md px-3 py-1.5 font-bold text-sm cursor-pointer transition-all border-none"
            style={{
              background: qty === q ? stock?.color : "rgba(255,255,255,0.08)",
              color: qty === q ? "#0a0e1a" : "#fff",
              fontFamily: "var(--font-mono)",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {q}
          </button>
        ))}
        <button
          onClick={() => setQty(Math.max(1, maxBuy))}
          disabled={disabled}
          className="rounded-md px-3 py-1.5 font-bold text-sm cursor-pointer transition-all border-none"
          style={{
            background:
              qty === maxBuy && maxBuy > 0 ? stock?.color : "rgba(255,255,255,0.08)",
            color: qty === maxBuy && maxBuy > 0 ? "#0a0e1a" : "#fff",
            fontFamily: "var(--font-mono)",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          MAX
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleTrade("buy")}
          disabled={disabled}
          className="flex-1 rounded-lg py-3 text-base font-bold cursor-pointer border-none tracking-wider"
          style={{
            background: "#76FF03",
            color: "#0a0e1a",
            fontFamily: "var(--font-pixel)",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          BUY
        </button>
        <button
          onClick={() => handleTrade("sell")}
          disabled={disabled}
          className="flex-1 rounded-lg py-3 text-base font-bold cursor-pointer border-none tracking-wider"
          style={{
            background: "#FF3D71",
            color: "#fff",
            fontFamily: "var(--font-pixel)",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          SELL
        </button>
      </div>

      <div className="text-xs text-center" style={{ color: "#666" }}>
        Cost: ${cost.toFixed(2)} · Max buy: {maxBuy}
      </div>
    </div>
  );
}
