import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useCallback, useRef, useEffect, useState } from "react";
import { STOCKS } from "../../shared/constants.js";

// Inner component — must live inside ConversationProvider
function VoiceAgentInner({ onTradeRef, cashRef, holdingsRef, pricesRef, onSelectStockRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const { startSession, endSession, status, isSpeaking } = useConversation();

  const buildSessionConfig = useCallback((overrides = {}) => ({
    agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,
    overrides: {
      agent: {
        firstMessage: "START!",
        ...overrides,
      },
    },
    clientTools: {
      buy_stock: async ({ symbol, quantity }) => {
        const stockIdx = STOCKS.findIndex((s) => s.symbol === symbol?.toUpperCase());
        if (stockIdx === -1) {
          return `Unknown stock: ${symbol}. Available: ${STOCKS.map((s) => s.symbol).join(", ")}`;
        }
        const qty = Math.max(1, parseInt(quantity) || 1);
        const price = pricesRef.current[stockIdx];
        const cost = price * qty;
        if (cost > cashRef.current) {
          const maxQty = Math.floor(cashRef.current / price);
          return `Not enough cash. Need $${cost.toFixed(2)}, have $${cashRef.current.toFixed(2)}. Max: ${maxQty} shares.`;
        }
        onTradeRef.current({ stockIdx, qty, type: "buy" });
        return `Bought ${qty} ${STOCKS[stockIdx].symbol} at $${price.toFixed(2)}.`;
      },
      sell_stock: async ({ symbol, quantity }) => {
        const stockIdx = STOCKS.findIndex((s) => s.symbol === symbol?.toUpperCase());
        if (stockIdx === -1) {
          return `Unknown stock: ${symbol}. Available: ${STOCKS.map((s) => s.symbol).join(", ")}`;
        }
        const qty = Math.max(1, parseInt(quantity) || 1);
        const held = holdingsRef.current[stockIdx] || 0;
        if (held < qty) return `Only have ${held} shares of ${symbol}. Cannot sell ${qty}.`;
        const price = pricesRef.current[stockIdx];
        onTradeRef.current({ stockIdx, qty, type: "sell" });
        return `Sold ${qty} ${STOCKS[stockIdx].symbol} at $${price.toFixed(2)}.`;
      },
      get_market_status: async () => {
        const stocks = STOCKS.map((s, i) => {
          const held = holdingsRef.current[i] || 0;
          return `${s.symbol} $${pricesRef.current[i].toFixed(2)} (holding ${held})`;
        }).join(" | ");
        return `Cash: $${cashRef.current.toFixed(2)} | ${stocks}`;
      },
      select_stock: async ({ symbol }) => {
        const stockIdx = STOCKS.findIndex((s) => s.symbol === symbol?.toUpperCase());
        if (stockIdx === -1) return `Unknown stock: ${symbol}`;
        onSelectStockRef.current(stockIdx);
        return `Now viewing ${STOCKS[stockIdx].symbol} at $${pricesRef.current[stockIdx].toFixed(2)}.`;
      },
    },
  }), [onTradeRef, cashRef, holdingsRef, pricesRef, onSelectStockRef]);

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      startSession(buildSessionConfig({ firstMessage: undefined }));
    } catch (err) {
      console.error("[VoiceAgent] Failed to start:", err);
    }
  }, [startSession, buildSessionConfig]);

  const stopConversation = useCallback(() => {
    endSession();
  }, [endSession]);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  const indicatorColor = isConnected
    ? isSpeaking ? "#FFD600" : "#76FF03"
    : isConnecting ? "#00E5FF" : "#555";

  const statusLabel = isConnected
    ? isSpeaking ? "SPEAKING" : "LISTENING"
    : isConnecting ? "CONNECTING..." : "BROKER OFFLINE";

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded panel */}
      {isOpen && (
        <div
          className="rounded-xl p-4 flex flex-col gap-3 w-52 animate-slide-up"
          style={{
            background: "rgba(10,14,26,0.96)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="text-xs tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}
          >
            BROKER AI
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: indicatorColor,
                boxShadow: isConnected ? `0 0 8px ${indicatorColor}` : "none",
              }}
            />
            <span className="text-xs" style={{ color: indicatorColor, fontFamily: "var(--font-mono)" }}>
              {statusLabel}
            </span>
          </div>

          {isSpeaking && (
            <div className="flex items-center gap-0.5 h-5 justify-center">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full voice-wave-bar"
                  style={{ background: "#FFD600", animationDelay: `${i * 0.09}s` }}
                />
              ))}
            </div>
          )}

          <button
            onClick={isConnected || isConnecting ? stopConversation : startConversation}
            disabled={isConnecting}
            className="w-full rounded-lg py-2 text-xs font-bold tracking-wider border-none cursor-pointer transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: "var(--font-pixel)",
              background: isConnected ? "#FF3D71" : "#76FF03",
              color: "#0a0e1a",
            }}
          >
            {isConnecting ? "CONNECTING..." : isConnected ? "HANG UP" : "CALL BROKER"}
          </button>

          <div className="text-xs leading-relaxed" style={{ color: "#444", fontFamily: "var(--font-mono)" }}>
            Say "buy 10 MOON" or "sell all REKT"
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-12 h-12 rounded-full flex items-center justify-center border-none cursor-pointer text-xl transition-transform hover:scale-110"
        style={{
          background: isConnected
            ? isSpeaking ? "rgba(255,214,0,0.2)" : "rgba(118,255,3,0.15)"
            : "rgba(255,255,255,0.07)",
          border: `1px solid ${isConnected ? indicatorColor : "rgba(255,255,255,0.1)"}`,
          boxShadow: isConnected ? `0 0 16px ${indicatorColor}44` : "none",
        }}
        title="Broker AI"
      >
        📞
      </button>
    </div>
  );
}

// Outer component — syncs props → refs and provides the conversation context
export default function VoiceAgent({ onTrade, cash, holdings, prices, onSelectStock }) {
  const onTradeRef = useRef(onTrade);
  const cashRef = useRef(cash);
  const holdingsRef = useRef(holdings);
  const pricesRef = useRef(prices);
  const onSelectStockRef = useRef(onSelectStock);

  useEffect(() => { onTradeRef.current = onTrade; }, [onTrade]);
  useEffect(() => { cashRef.current = cash; }, [cash]);
  useEffect(() => { holdingsRef.current = holdings; }, [holdings]);
  useEffect(() => { pricesRef.current = prices; }, [prices]);
  useEffect(() => { onSelectStockRef.current = onSelectStock; }, [onSelectStock]);

  return (
    <ConversationProvider>
      <VoiceAgentInner
        onTradeRef={onTradeRef}
        cashRef={cashRef}
        holdingsRef={holdingsRef}
        pricesRef={pricesRef}
        onSelectStockRef={onSelectStockRef}
      />
    </ConversationProvider>
  );
}
