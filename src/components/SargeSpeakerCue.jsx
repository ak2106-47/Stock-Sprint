/** Labels story UI as Sarge’s voice; highlights while ElevenLabs audio plays. */
export default function SargeSpeakerCue({ isSpeaking }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5 select-none" aria-live="polite">
      <span className="text-[9px] font-bold tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
        SARGE
      </span>
      <span className="text-[8px] tracking-wide" style={{ fontFamily: "var(--font-mono)", color: "#8a8a8a" }}>
        {isSpeaking ? (
          <span className="text-[#00E5FF]">● speaking · tap to skip ahead</span>
        ) : (
          <span>tap the bubble when you are ready for the next line</span>
        )}
      </span>
    </div>
  );
}
