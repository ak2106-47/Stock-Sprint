/**
 * Full-screen red vignette that pulses when time is running out.
 * ≤10s → slow pulse, ≤5s → fast pulse.
 */
export default function UrgencyOverlay({ timeLeft }) {
  if (timeLeft > 10) return null;

  const fast = timeLeft <= 5;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        boxShadow: "inset 0 0 120px 40px rgba(255,30,60,0.35)",
        animation: `urgency-pulse ${fast ? "0.5s" : "1.2s"} ease-in-out infinite`,
      }}
    />
  );
}
