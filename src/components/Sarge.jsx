import { useState, useCallback, useEffect } from "react";
import DialogBubble from "./DialogBubble.jsx";
import SituationCard from "./SituationCard.jsx";
import SargeSpeakerCue from "./SargeSpeakerCue.jsx";
import { useStoryNarrator } from "../hooks/useStoryNarrator.js";

/** Linear story beats only — each item is a dialog line (optional scene on line). */
function toSteps(dialog) {
  return (dialog ?? [])
    .filter((item) => item && item.type !== "choice")
    .map((item) => ({ kind: "line", line: item }));
}

/** Served from /public/story — story-mode mascot art. */
const SARGE_SRC = "/story/sarge.png";

const voiceEnabledDefault = import.meta.env.VITE_STORY_VOICE_ENABLED !== "false";

function SargePortrait({ size, isSpeaking }) {
  const isLarge = size === "large";
  return (
    <div className="flex shrink-0 flex-col items-center gap-2 self-start">
      <div
        className={`rounded-2xl p-1.5 sm:p-2 transition-all duration-300 ${
          isSpeaking
            ? "bg-[rgba(255,214,0,0.14)] shadow-[0_0_40px_rgba(255,214,0,0.38)] ring-2 ring-[#FFD60055]"
            : "ring-2 ring-transparent"
        }`}
      >
        <img
          src={SARGE_SRC}
          alt="Sarge"
          className={
            isLarge
              ? "h-[clamp(6.25rem,22vmin,10.5rem)] w-auto max-h-[10.5rem] max-w-none object-contain object-bottom drop-shadow-[0_8px_22px_rgba(0,0,0,0.5)] select-none"
              : "h-[clamp(5rem,16vmin,6.75rem)] w-auto max-h-[6.75rem] max-w-none object-contain object-bottom drop-shadow-[0_6px_16px_rgba(0,0,0,0.4)] select-none"
          }
          draggable={false}
        />
      </div>
      <span
        className="text-[8px] font-bold tracking-widest text-center leading-snug max-w-[11rem] sm:max-w-[12rem]"
        style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}
      >
        SARGE · YOUR GUIDE
      </span>
    </div>
  );
}

export default function Sarge({
  dialog,
  onDialogComplete,
  size = "large",
  voiceEnabled = voiceEnabledDefault,
  typingSpeed = 22,
}) {
  const [steps, setSteps] = useState(() => toSteps(dialog));
  const [lineIndex, setLineIndex] = useState(0);

  const { speak, stop, isSpeaking } = useStoryNarrator(voiceEnabled);

  useEffect(() => {
    setSteps(toSteps(dialog));
    setLineIndex(0);
  }, [dialog]);

  const step = steps[lineIndex];

  useEffect(() => {
    if (!voiceEnabled) return;
    const s = steps[lineIndex];
    if (!s?.line?.text) return;
    speak(s.line.text);
    return () => stop();
  }, [steps, lineIndex, voiceEnabled, speak, stop]);

  const handleAdvance = useCallback(() => {
    if (!step) return;
    if (lineIndex >= steps.length - 1) {
      onDialogComplete?.();
    } else {
      setLineIndex((i) => i + 1);
    }
  }, [lineIndex, steps.length, onDialogComplete, step]);

  if (!step) return null;

  const bubbleKey = `L${lineIndex}-${step.line.text?.slice(0, 24) ?? ""}`;
  const speakerCue = <SargeSpeakerCue isSpeaking={isSpeaking} />;

  return (
    <div className="flex w-full animate-slide-up flex-col gap-4">
      <div className="flex w-full max-w-full flex-row flex-nowrap items-start gap-3 overflow-x-auto pb-1 sm:gap-4 md:gap-6 [scrollbar-width:thin]">
        <SargePortrait size={size} isSpeaking={isSpeaking} />

        <div className="flex min-w-0 w-full max-w-md flex-col gap-3 pt-0.5 sm:max-w-lg">
          {step.line.scene && (
            <SituationCard
              icon={step.line.scene.icon}
              headline={step.line.scene.headline}
              accent={step.line.scene.accent ?? "#00E5FF"}
            >
              {step.line.scene.detail && (
                <div className="text-xs mt-1" style={{ color: "#aaa" }}>
                  {step.line.scene.detail}
                </div>
              )}
            </SituationCard>
          )}
          <DialogBubble
            key={bubbleKey}
            text={step.line.text}
            header={speakerCue}
            typingSpeed={typingSpeed}
            onComplete={handleAdvance}
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap justify-center max-w-full">
        {steps.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all shrink-0"
            style={{
              background:
                i === lineIndex ? "#FFD600" : i < lineIndex ? "rgba(118,255,3,0.5)" : "rgba(255,255,255,0.12)",
              transform: i === lineIndex ? "scale(1.35)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
