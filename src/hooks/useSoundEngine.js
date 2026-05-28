import { useRef, useCallback, useEffect, useMemo } from "react";

const AudioCtx = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;

/** Multiply all SFX / ambient levels (0.7 ≈ 30% quieter than before). */
const SFX_LEVEL = 0.7;

function createOscSound(ctx, freq, duration, type = "sine", gain = 0.15) {
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  const g = gain * SFX_LEVEL;
  vol.gain.setValueAtTime(g, ctx.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(vol);
  vol.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playBell(ctx) {
  [800, 1000, 1200].forEach((freq, i) => {
    setTimeout(() => createOscSound(ctx, freq, 0.6, "sine", 0.12), i * 120);
  });
}

function playChaChing(ctx) {
  createOscSound(ctx, 1400, 0.08, "square", 0.1);
  setTimeout(() => createOscSound(ctx, 1800, 0.08, "square", 0.1), 60);
  setTimeout(() => createOscSound(ctx, 2200, 0.15, "square", 0.12), 120);
}

function playSell(ctx) {
  createOscSound(ctx, 600, 0.08, "sawtooth", 0.08);
  setTimeout(() => createOscSound(ctx, 500, 0.1, "sawtooth", 0.06), 80);
}

function playNewsAlert(ctx) {
  createOscSound(ctx, 440, 0.1, "triangle", 0.08);
  setTimeout(() => createOscSound(ctx, 660, 0.15, "triangle", 0.1), 100);
}

function playBigMove(ctx) {
  [300, 400, 500, 600].forEach((freq, i) => {
    setTimeout(() => createOscSound(ctx, freq, 0.12, "sawtooth", 0.06), i * 50);
  });
}

function playError(ctx) {
  createOscSound(ctx, 200, 0.15, "square", 0.1);
  setTimeout(() => createOscSound(ctx, 150, 0.2, "square", 0.08), 100);
}

export default function useSoundEngine() {
  const ctxRef = useRef(null);
  const ambientRef = useRef(null);

  /** Call once from a click/tap handler so Web Audio runs under user activation (no spurious permission prompts). */
  const unlock = useCallback(() => {
    if (!AudioCtx) return;
    if (!ctxRef.current) {
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }, []);

  const getCtx = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state === "closed") return null;
    return ctx;
  }, []);

  const startAmbient = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || ambientRef.current) return;

    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015;
    }
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, ctx.currentTime);

    const vol = ctx.createGain();
    vol.gain.setValueAtTime(0.08 * SFX_LEVEL, ctx.currentTime);

    noise.connect(filter);
    filter.connect(vol);
    vol.connect(ctx.destination);
    noise.start();

    ambientRef.current = { noise, vol };
  }, [getCtx]);

  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      try { ambientRef.current.noise.stop(); } catch {}
      ambientRef.current = null;
    }
  }, []);

  const bell = useCallback(() => {
    const ctx = getCtx();
    if (ctx) playBell(ctx);
  }, [getCtx]);

  const buy = useCallback(() => {
    const ctx = getCtx();
    if (ctx) playChaChing(ctx);
  }, [getCtx]);

  const sell = useCallback(() => {
    const ctx = getCtx();
    if (ctx) playSell(ctx);
  }, [getCtx]);

  const news = useCallback(() => {
    const ctx = getCtx();
    if (ctx) playNewsAlert(ctx);
  }, [getCtx]);

  const bigMove = useCallback(() => {
    const ctx = getCtx();
    if (ctx) playBigMove(ctx);
  }, [getCtx]);

  const error = useCallback(() => {
    const ctx = getCtx();
    if (ctx) playError(ctx);
  }, [getCtx]);

  useEffect(() => {
    return () => {
      stopAmbient();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, [stopAmbient]);

  return useMemo(
    () => ({ unlock, startAmbient, stopAmbient, bell, buy, sell, news, bigMove, error }),
    [unlock, startAmbient, stopAmbient, bell, buy, sell, news, bigMove, error],
  );
}
