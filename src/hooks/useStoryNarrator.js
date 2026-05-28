import { useState, useRef, useCallback, useEffect } from "react";

const MAX_CHARS = 2000;
const STORY_VOICE_GAIN = 1.05;

function ttsPlainText(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHARS);
}

/**
 * Plays Sarge story lines via POST /api/tts (ElevenLabs on the server).
 * API key stays server-side; in dev Vite proxies /api to the Node server.
 */
export function useStoryNarrator(enabled = true) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const abortRef = useRef(null);
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);

  const disconnectVoiceNodes = useCallback(() => {
    if (nodesRef.current) {
      try {
        nodesRef.current.src.disconnect();
        nodesRef.current.gain.disconnect();
      } catch {
        /* already disconnected */
      }
      nodesRef.current = null;
    }
  }, []);

  const hardStop = useCallback(() => {
    abortRef.current?.abort();
    disconnectVoiceNodes();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, [disconnectVoiceNodes]);

  const speak = useCallback(
    (rawText) => {
      if (!enabled) return;
      const text = ttsPlainText(rawText);
      if (!text) return;

      hardStop();
      const ac = new AbortController();
      abortRef.current = ac;

      const base = (import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "");

      (async () => {
        try {
          const res = await fetch(`${base}/api/tts`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
            body: JSON.stringify({ text }),
            signal: ac.signal,
          });

          if (!res.ok) {
            if (res.status !== 503) console.warn("[StoryNarrator] TTS", res.status);
            return;
          }

          const blob = await res.blob();
          if (ac.signal.aborted) return;

          const objectUrl = URL.createObjectURL(blob);
          objectUrlRef.current = objectUrl;
          const audio = new Audio(objectUrl);
          audioRef.current = audio;

          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            if (!ctxRef.current || ctxRef.current.state === "closed") {
              ctxRef.current = new AudioCtx();
            }
            const actx = ctxRef.current;
            await actx.resume().catch(() => {});
            disconnectVoiceNodes();
            const src = actx.createMediaElementSource(audio);
            const gain = actx.createGain();
            gain.gain.value = STORY_VOICE_GAIN;
            src.connect(gain);
            gain.connect(actx.destination);
            nodesRef.current = { src, gain };
          } else {
            audio.volume = 1;
          }

          audio.addEventListener("ended", () => {
            disconnectVoiceNodes();
            URL.revokeObjectURL(objectUrl);
            objectUrlRef.current = null;
            audioRef.current = null;
            setIsSpeaking(false);
          });

          audio.addEventListener("error", () => {
            disconnectVoiceNodes();
            URL.revokeObjectURL(objectUrl);
            objectUrlRef.current = null;
            audioRef.current = null;
            setIsSpeaking(false);
          });

          setIsSpeaking(true);
          await audio.play();
        } catch (e) {
          disconnectVoiceNodes();
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
          if (e.name !== "AbortError") console.warn("[StoryNarrator]", e);
          setIsSpeaking(false);
        }
      })();
    },
    [enabled, disconnectVoiceNodes, hardStop],
  );

  useEffect(() => {
    if (!enabled) hardStop();
  }, [enabled, hardStop]);

  useEffect(
    () => () => {
      hardStop();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    },
    [hardStop],
  );

  return { speak, stop: hardStop, isSpeaking };
}
