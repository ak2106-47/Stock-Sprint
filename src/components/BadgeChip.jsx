import { useState, useRef, useEffect } from "react";

export default function BadgeChip({ badge }) {
  const [show, setShow] = useState(false);
  const tipRef = useRef(null);
  const chipRef = useRef(null);

  useEffect(() => {
    if (!show || !tipRef.current || !chipRef.current) return;
    const chip = chipRef.current.getBoundingClientRect();
    const tip = tipRef.current;
    const tipRect = tip.getBoundingClientRect();

    if (chip.top - tipRect.height - 8 < 0) {
      tip.style.top = "100%";
      tip.style.bottom = "auto";
      tip.style.marginTop = "8px";
    }

    const overflowRight = chip.left + chip.width / 2 + tipRect.width / 2 - window.innerWidth;
    if (overflowRight > 0) {
      tip.style.left = `calc(50% - ${overflowRight + 8}px)`;
    }
    const overflowLeft = -(chip.left + chip.width / 2 - tipRect.width / 2);
    if (overflowLeft > 0) {
      tip.style.left = `calc(50% + ${overflowLeft + 8}px)`;
    }
  }, [show]);

  return (
    <div
      ref={chipRef}
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow((s) => !s)}
    >
      <div
        className="rounded-lg px-3 py-1.5 text-sm cursor-default transition-all"
        style={{
          background: "rgba(255,214,0,0.1)",
          border: "1px solid rgba(255,214,0,0.2)",
        }}
      >
        {badge.icon} {badge.label}
      </div>

      {show && (
        <div
          ref={tipRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          style={{ width: "max-content", maxWidth: 220 }}
        >
          <div
            className="rounded-lg px-3 py-2.5 text-center"
            style={{
              background: "#1a1e2e",
              border: "1px solid rgba(255,214,0,0.3)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >
            <div className="text-xs font-medium leading-snug" style={{ color: "#ddd" }}>
              {badge.desc}
            </div>
            {badge.threshold && (
              <div
                className="text-[10px] font-bold tracking-wider mt-1"
                style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}
              >
                {badge.threshold}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
