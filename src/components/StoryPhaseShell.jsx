/** Full-viewport story beat wrapper: optional chapter backdrop + tint for readable UI. */
export default function StoryPhaseShell({ backdropUrl, children }) {
  if (!backdropUrl) {
    return children;
  }

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#0a0e1a]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${encodeURI(backdropUrl)})`,
          imageRendering: "pixelated",
        }}
        aria-hidden
        role="presentation"
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#0a0e1a]/35 via-[#0a0e1a]/45 to-[#0a0e1a]/60"
        aria-hidden
      />
      <div className="relative z-10 min-h-dvh">{children}</div>
    </div>
  );
}
