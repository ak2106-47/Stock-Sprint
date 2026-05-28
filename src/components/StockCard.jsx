import { STOCKS } from "../../shared/constants.js";
import MiniChart from "./MiniChart.jsx";

export default function StockCard({ index, price, history, holdings, selected, onSelect }) {
  const stock = STOCKS[index];
  const change =
    history && history.length > 1
      ? (((price - history[0]) / history[0]) * 100).toFixed(1)
      : "0.0";
  const isUp = parseFloat(change) >= 0;

  return (
    <button
      onClick={() => onSelect(index)}
      className="rounded-lg p-2 text-left transition-all cursor-pointer border-2"
      style={{
        background: selected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
        borderColor: selected ? stock.color : "transparent",
      }}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-sm" style={{ color: stock.color }}>
          {stock.symbol}
        </span>
        <span className="text-xs" style={{ color: isUp ? "#76FF03" : "#FF3D71" }}>
          {isUp ? "▲" : "▼"}
          {change}%
        </span>
      </div>
      <div className="text-base font-bold my-0.5">${price?.toFixed(2)}</div>
      <MiniChart history={history?.slice(-60)} color={stock.color} width={120} height={28} />
      {holdings > 0 && (
        <div className="text-[10px] mt-1" style={{ color: "#aaa" }}>
          Holding: {holdings} shares
        </div>
      )}
    </button>
  );
}
