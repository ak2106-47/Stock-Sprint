import { useState, useEffect, useRef, useCallback } from "react";
import { STOCKS, TICK_MS } from "../../../shared/constants.js";

export default function FirstBuyGame({ config, onComplete }) {
  const stock = STOCKS[config.stockIdx];
  const [price, setPrice] = useState(stock.basePrice);
  const [phase, setPhase] = useState("ready");
  const [buyPrice, setBuyPrice] = useState(null);
  const [profit, setProfit] = useState(null);
  const tickRef = useRef(null);

  const priceDrift = typeof config.priceDrift === "number" ? config.priceDrift : 0.002;
  const shockScale = typeof config.shockScale === "number" ? config.shockScale : 1;

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setPrice((prev) => {
        const shock = (Math.random() - 0.5) * 2 * 0.015 * shockScale;
        return Math.max(0.01, parseFloat((prev * (1 + shock + priceDrift)).toFixed(2)));
      });
    }, TICK_MS);
    return () => clearInterval(tickRef.current);
  }, [priceDrift, shockScale]);

  const handleBuy = () => {
    setBuyPrice(price);
    setPhase("bought");
  };

  const handleSell = () => {
    const pnl = price - buyPrice;
    setProfit(pnl);
    setPhase("sold");
    clearInterval(tickRef.current);
  };

  const handleContinue = useCallback(() => {
    onComplete?.(profit > 0);
  }, [onComplete, profit]);

  const handleContinueKey = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleContinue();
    }
  }, [handleContinue]);

  const pnlColor = profit !== null ? (profit >= 0 ? "#76FF03" : "#FF3D71") : "#fff";

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto animate-slide-up">
      <div className="text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
        {config.title ?? "MINI-GAME: YOUR FIRST TRADE"}
      </div>

      <div className="text-sm text-center px-1" style={{ color: "#aaa" }}>
        {config.instructions}
      </div>

      <div className="rounded-xl p-5 w-full text-center" style={{ background: "rgba(255,255,255,0.06)", border: `2px solid ${stock.color}44` }}>
        <div className="text-lg font-bold" style={{ color: stock.color }}>{stock.symbol}</div>
        <div className="text-sm" style={{ color: "#888" }}>{stock.name}</div>
        <div className="text-3xl font-bold my-3 transition-all" style={{ fontFamily: "var(--font-mono)" }}>
          ${price.toFixed(2)}
        </div>
        {phase === "bought" && buyPrice && (
          <div className="text-sm" style={{ color: price >= buyPrice ? "#76FF03" : "#FF3D71" }}>
            {price >= buyPrice ? "▲" : "▼"} {((price - buyPrice) / buyPrice * 100).toFixed(1)}% since you bought
          </div>
        )}
      </div>

      {phase === "ready" && (
        <button
          autoFocus
          onClick={handleBuy}
          className="rounded-xl py-4 px-12 font-bold text-lg cursor-pointer border-none tracking-wider transition-transform hover:scale-105 animate-pulse-border border-2"
          style={{ fontFamily: "var(--font-pixel)", background: "#76FF03", color: "#0a0e1a", borderColor: "#76FF03" }}
        >
          BUY 1 SHARE
        </button>
      )}

      {phase === "bought" && (
        <button
          autoFocus
          onClick={handleSell}
          className="rounded-xl py-4 px-12 font-bold text-lg cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
          style={{ fontFamily: "var(--font-pixel)", background: "#FF3D71", color: "#fff" }}
        >
          SELL
        </button>
      )}

      {phase === "sold" && profit !== null && (
        <div className="flex flex-col items-center gap-4 animate-slide-up">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2" style={{ color: pnlColor }}>
              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
            </div>
            <div className="text-sm" style={{ color: "#aaa" }}>
              {profit >= 0 ? config.successText : config.failText}
            </div>
          </div>
          <button
            autoFocus
            onClick={handleContinue}
            onKeyDown={handleContinueKey}
            className="rounded-xl py-3 px-8 font-bold text-sm cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
            style={{ fontFamily: "var(--font-pixel)", background: "#FFD600", color: "#0a0e1a" }}
          >
            CONTINUE ▶
          </button>
        </div>
      )}
    </div>
  );
}
