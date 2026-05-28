export default function ObjectiveTracker({ text, completed }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: completed ? "rgba(118,255,3,0.1)" : "rgba(255,214,0,0.08)",
        border: `1px solid ${completed ? "#76FF0344" : "#FFD60044"}`,
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm transition-all"
        style={{
          background: completed ? "#76FF03" : "transparent",
          border: completed ? "none" : "2px solid #FFD60066",
          color: "#0a0e1a",
        }}
      >
        {completed ? "✓" : ""}
      </div>
      <div>
        <div className="text-[10px] tracking-wider mb-0.5" style={{ fontFamily: "var(--font-pixel)", color: completed ? "#76FF03" : "#FFD600" }}>
          {completed ? "OBJECTIVE COMPLETE" : "OBJECTIVE"}
        </div>
        <div className="text-xs" style={{ color: completed ? "#76FF03" : "#ccc" }}>{text}</div>
      </div>
    </div>
  );
}
