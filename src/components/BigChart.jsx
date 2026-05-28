import { STOCKS, MAX_HISTORY } from "../../shared/constants.js";

const W = 600;

export default function BigChart({ histories, selectedIdx, compact = false }) {
  const H = compact ? 140 : 200;
  const stock = STOCKS[selectedIdx];
  const history = histories?.[selectedIdx];
  if (!history || history.length < 2) {
    return (
      <div
        className="block w-full rounded-lg"
        style={compact ? { width: "100%", height: "100%" } : { width: "100%", aspectRatio: `${W}/${H}` }}
      />
    );
  }

  const min = Math.min(...history) * 0.98;
  const max = Math.max(...history) * 1.02;
  const range = max - min || 1;

  const points = history
    .map((v, i) => {
      const x = (i / (MAX_HISTORY - 1)) * W;
      const y = H - ((v - min) / range) * (H - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  const lastX = ((history.length - 1) / (MAX_HISTORY - 1)) * W;
  const lastY = H - ((history[history.length - 1] - min) / range) * (H - 20) - 10;

  const gridCount = compact ? 4 : 5;
  const gridLines = Array.from({ length: gridCount }, (_, i) => {
    const y = 10 + (i / (gridCount - 1)) * (H - 20);
    const val = max - (i / (gridCount - 1)) * range;
    return (
      <g key={i}>
        <line x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <text
          x={W - 4}
          y={y - 4}
          fill="rgba(255,255,255,0.3)"
          fontSize={compact ? "8" : "10"}
          textAnchor="end"
          fontFamily="var(--font-mono)"
        >
          ${val.toFixed(2)}
        </text>
      </g>
    );
  });

  return (
    <svg
      width="100%"
      height={compact ? "100%" : undefined}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={compact ? "none" : "xMidYMid meet"}
      className="block rounded-lg"
      style={{ background: "rgba(0,0,0,0.3)" }}
    >
      {gridLines}
      <polyline
        points={points}
        fill="none"
        stroke={stock.color}
        strokeWidth={compact ? "2" : "2.5"}
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx={lastX} cy={lastY} r={compact ? "3" : "4"} fill={stock.color} />
      <text x="8" y={compact ? "16" : "20"} fill={stock.color} fontSize={compact ? "11" : "14"} fontWeight="700" fontFamily="var(--font-pixel)">
        {stock.symbol}
      </text>
      <text x="8" y={compact ? "30" : "36"} fill="rgba(255,255,255,0.5)" fontSize={compact ? "8" : "10"} fontFamily="var(--font-mono)">
        {stock.name}
      </text>
    </svg>
  );
}
