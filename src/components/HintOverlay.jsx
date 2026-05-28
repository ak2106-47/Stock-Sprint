import { useState, useEffect } from "react";

export default function HintOverlay({ text, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!text) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [text, onDismiss]);

  if (!text || !visible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none animate-slide-up">
      <button
        onClick={() => { setVisible(false); onDismiss?.(); }}
        className="pointer-events-auto rounded-2xl px-5 py-3 flex items-center gap-3 cursor-pointer border-none max-w-md"
        style={{
          background: "rgba(10,14,26,0.95)",
          border: "2px solid rgba(255,214,0,0.4)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(255,214,0,0.1)",
        }}
      >
        <span className="text-xl shrink-0">💰</span>
        <span className="text-xs leading-relaxed" style={{ color: "#e0e0e0", fontFamily: "var(--font-mono)" }}>
          {text}
        </span>
      </button>
    </div>
  );
}
