import { useState, useMemo, useCallback } from "react";

function futureValue(principal, years, aprPercent) {
  const r = aprPercent / 100;
  if (r === -1) return 0;
  return principal * (1 + r) ** years;
}

export default function CompoundGrowthGame({ config, onComplete }) {
  const {
    title = "MINI-GAME: COMPOUND GROWTH",
    instructions = "Adjust the sliders. Compounding means gains earn future gains—the curve steepens over time.",
    principalMin = 100,
    principalMax = 5000,
    principalStep = 50,
    yearsMin = 1,
    yearsMax = 35,
    aprMin = 0,
    aprMax = 12,
    aprStep = 0.5,
  } = config;

  const [principal, setPrincipal] = useState(config.initialPrincipal ?? 1000);
  const [years, setYears] = useState(config.initialYears ?? 20);
  const [apr, setApr] = useState(config.initialApr ?? 7);

  const fv = useMemo(() => futureValue(principal, years, apr), [principal, years, apr]);
  const gain = fv - principal;

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
        {title}
      </div>
      <p className="text-sm text-center m-0" style={{ color: "#aaa" }}>
        {instructions}
      </p>

      <div className="w-full rounded-xl p-4 space-y-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,214,0,0.25)" }}>
        <div>
          <label className="flex justify-between text-xs mb-1" style={{ color: "#888" }}>
            <span>Starting amount</span>
            <span style={{ color: "#76FF03", fontFamily: "var(--font-mono)" }}>${principal.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={principalMin}
            max={principalMax}
            step={principalStep}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-[#76FF03]"
          />
        </div>
        <div>
          <label className="flex justify-between text-xs mb-1" style={{ color: "#888" }}>
            <span>Years invested</span>
            <span style={{ color: "#00E5FF", fontFamily: "var(--font-mono)" }}>{years} yrs</span>
          </label>
          <input
            type="range"
            min={yearsMin}
            max={yearsMax}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-[#00E5FF]"
          />
        </div>
        <div>
          <label className="flex justify-between text-xs mb-1" style={{ color: "#888" }}>
            <span>Average yearly return (simplified)</span>
            <span style={{ color: "#FFD600", fontFamily: "var(--font-mono)" }}>{apr}%</span>
          </label>
          <input
            type="range"
            min={aprMin}
            max={aprMax}
            step={aprStep}
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            className="w-full accent-[#FFD600]"
          />
        </div>
      </div>

      <div className="w-full text-center rounded-xl p-4" style={{ background: "rgba(118,255,3,0.08)", border: "1px solid #76FF0333" }}>
        <div className="text-xs mb-1" style={{ color: "#888" }}>
          Ending balance (illustration only—not a prediction)
        </div>
        <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-mono)", color: "#76FF03" }}>
          ${fv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div className="text-sm mt-1" style={{ color: gain >= 0 ? "#aaa" : "#FF3D71" }}>
          +${gain.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs. keeping cash under the mattress
        </div>
      </div>

      <p className="text-xs text-center m-0 leading-relaxed" style={{ color: "#666" }}>
        Real returns bounce around; fees and taxes matter. This toy shows the <strong style={{ color: "#aaa" }}>shape</strong> of compounding—not a forecast.
      </p>

      <button
        type="button"
        autoFocus
        onClick={handleDone}
        onKeyDown={handleKey}
        className="rounded-xl py-3 px-8 font-bold text-sm cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
        style={{ fontFamily: "var(--font-pixel)", background: "#FFD600", color: "#0a0e1a" }}
      >
        CONTINUE ▶
      </button>
    </div>
  );
}
