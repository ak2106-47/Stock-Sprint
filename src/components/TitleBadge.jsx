import { TRADER_TITLES, STARTING_CASH } from "../../shared/constants.js";

export default function TitleBadge({ portfolioValue }) {
  const returnPct = ((portfolioValue - STARTING_CASH) / STARTING_CASH) * 100;

  let current = TRADER_TITLES[0];
  for (const t of TRADER_TITLES) {
    if (returnPct >= t.minReturn) current = t;
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all"
      style={{
        background: `${current.color}15`,
        border: `1px solid ${current.color}33`,
      }}
    >
      <span className="text-sm">{current.icon}</span>
      <span
        className="text-[10px] font-bold tracking-wider"
        style={{ fontFamily: "var(--font-pixel)", color: current.color }}
      >
        {current.title}
      </span>
    </div>
  );
}
