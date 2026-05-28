import { useState } from "react";
import { GAME_DURATIONS } from "../../shared/constants.js";

export default function DurationPicker({ value, onChange }) {
  const [customMode, setCustomMode] = useState(false);
  const [customMin, setCustomMin] = useState("");

  const isPreset = GAME_DURATIONS.some((d) => d.seconds === value);

  function applyCustom() {
    const mins = parseFloat(customMin);
    if (!isNaN(mins) && mins >= 0.5 && mins <= 30) {
      onChange(Math.round(mins * 60));
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-bold tracking-wider" style={{ color: "#666" }}>
          DURATION:
        </span>
        <div className="flex gap-2 flex-wrap justify-center">
          {GAME_DURATIONS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => { setCustomMode(false); onChange(d.seconds); }}
              className="btn-pixel px-4 py-2.5 font-bold text-sm cursor-pointer border-2 transition-all"
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 11,
                background: !customMode && value === d.seconds ? "rgba(255,214,0,0.15)" : "rgba(255,255,255,0.04)",
                borderColor: !customMode && value === d.seconds ? "#FFD600" : "rgba(255,255,255,0.08)",
                color: !customMode && value === d.seconds ? "#FFD600" : "#666",
              }}
            >
              {d.label}
            </button>
          ))}
          <button
            onClick={() => setCustomMode((m) => !m)}
            className="btn-pixel px-4 py-2.5 font-bold text-sm cursor-pointer border-2 transition-all"
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 11,
              background: customMode ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.04)",
              borderColor: customMode ? "#00E5FF" : "rgba(255,255,255,0.08)",
              color: customMode ? "#00E5FF" : "#666",
            }}
          >
            CUSTOM
          </button>
        </div>
      </div>

      {customMode && (
        <div className="flex items-center gap-2 animate-slide-up">
          <input
            type="number"
            min={0.5}
            max={30}
            step={0.5}
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCustom()}
            placeholder="mins"
            className="rounded-lg px-3 py-2 text-center text-sm font-bold border-2 outline-none w-24"
            style={{
              background: "rgba(0,229,255,0.07)",
              borderColor: "#00E5FF44",
              color: "#00E5FF",
              fontFamily: "var(--font-mono)",
            }}
          />
          <button
            onClick={applyCustom}
            className="btn-pixel px-4 py-2 font-bold text-xs cursor-pointer border-2 transition-all"
            style={{
              fontFamily: "var(--font-pixel)",
              background: "rgba(0,229,255,0.15)",
              borderColor: "#00E5FF",
              color: "#00E5FF",
            }}
          >
            SET
          </button>
          <span className="text-xs" style={{ color: "#555" }}>
            {customMin && !isNaN(parseFloat(customMin))
              ? `= ${Math.round(parseFloat(customMin) * 60)}s`
              : "0.5–30 min"}
          </span>
        </div>
      )}

      {customMode && !isPreset && (
        <div className="text-xs" style={{ color: "#FFD600" }}>
          Set to {Math.floor(value / 60)}m {value % 60 > 0 ? `${value % 60}s` : ""}
        </div>
      )}
    </div>
  );
}
