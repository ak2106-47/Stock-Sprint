/** Framed “you are here” strip for story beats — icon + headline above dialog. */
const PANEL_BG = "#121826";

export default function SituationCard({ icon, headline, accent = "#00E5FF", children }) {
  return (
    <div
      className="w-full rounded-xl border-2 px-4 py-3 mb-1 animate-slide-up"
      style={{
        borderColor: accent,
        backgroundColor: PANEL_BG,
        boxShadow: `0 4px 20px rgba(0,0,0,0.45)`,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0 leading-none" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="text-[10px] font-bold tracking-widest mb-0.5 break-words leading-tight"
            style={{ fontFamily: "var(--font-pixel)", color: accent }}
          >
            {headline}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
