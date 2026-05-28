export default function MiniChart({ history, color, width = 120, height = 28 }) {
  if (!history || history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const points = history
    .map((v, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
