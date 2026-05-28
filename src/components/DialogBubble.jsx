import { useState, useEffect, useRef, useCallback } from "react";

export default function DialogBubble({ text, onComplete, autoAdvance = false, typingSpeed = 22, header = null }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef(null);
  const indexRef = useRef(0);
  const btnRef = useRef(null);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        clearInterval(intervalRef.current);
        setDisplayedText(text);
        setIsTyping(false);
        if (autoAdvance) {
          setTimeout(() => onComplete?.(), 1200);
        }
        return;
      }
      setDisplayedText(text.slice(0, indexRef.current + 1));
    }, typingSpeed);

    return () => clearInterval(intervalRef.current);
  }, [text, typingSpeed, autoAdvance, onComplete]);

  useEffect(() => {
    btnRef.current?.focus();
  }, [text]);

  const handleAdvance = useCallback(() => {
    if (isTyping) {
      clearInterval(intervalRef.current);
      setDisplayedText(text);
      setIsTyping(false);
    } else {
      onComplete?.();
    }
  }, [isTyping, text, onComplete]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAdvance();
    }
  }, [handleAdvance]);

  return (
    <div className="w-full flex flex-col gap-3">
      {header}
      <button
        ref={btnRef}
        onClick={handleAdvance}
        onKeyDown={handleKeyDown}
        className="w-full text-left rounded-2xl p-5 cursor-pointer border-2 transition-all relative"
        style={{
          backgroundColor: "#141c2e",
          borderColor: "rgba(255, 214, 0, 0.55)",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(13px, 2.5vw, 15px)",
          lineHeight: 1.7,
          color: "#e0e0e0",
        }}
      >
        <div style={{ minHeight: "1.7em" }}>
          {displayedText}
          {isTyping && (
            <span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ background: "#FFD600", verticalAlign: "text-bottom" }} />
          )}
        </div>
      </button>

      {!isTyping && !autoAdvance && (
        <button
          onClick={handleAdvance}
          onKeyDown={handleKeyDown}
          autoFocus
          className="self-end rounded-xl py-2.5 px-6 font-bold text-sm cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
          style={{
            fontFamily: "var(--font-pixel)",
            background: "#FFD600",
            color: "#0a0e1a",
            fontSize: "11px",
          }}
        >
          NEXT ▶
        </button>
      )}
    </div>
  );
}
