export default function FlashMessage({ message, color }) {
  if (!message) return null;
  return (
    <div
      className="fixed top-1/2 left-1/2 z-50 animate-flash-in rounded-xl px-8 py-4 text-center"
      style={{
        transform: "translate(-50%, -50%)",
        background: "rgba(10,14,26,0.92)",
        border: `3px solid ${color}`,
        color,
        fontFamily: "var(--font-pixel)",
        fontSize: 14,
        boxShadow: `0 0 40px ${color}44`,
      }}
    >
      {message}
    </div>
  );
}
