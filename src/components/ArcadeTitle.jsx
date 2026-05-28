import { useEffect, useLayoutEffect, useRef } from "react";

function arcadeTextShadow(gx, gy) {
  const x = gx || 0;
  const y = gy || 0;
  return [
    `${3 + x * 0.9}px 4px 0 rgba(160, 70, 0, 0.94)`,
    `${-2 - x}px ${-1.5 - y}px 0 rgba(0, 229, 255, 0.48)`,
    `${2 + x}px ${-3.5 - y}px 0 rgba(255, 61, 113, 0.42)`,
    `0 0 38px rgba(255, 214, 0, 0.55)`,
    `0 0 60px rgba(255, 214, 0, 0.2)`,
    `0 7px 0 rgba(0, 0, 0, 0.58)`,
  ].join(", ");
}

const INNER_STYLE = {
  fontFamily: "var(--font-pixel)",
  fontSize: "clamp(40px, 12vw, 80px)",
  color: "#FFD600",
  lineHeight: 1.35,
  letterSpacing: "0.04em",
  display: "block",
};

/**
 * Retro arcade hero title: motion + flicker on an outer wrapper so React’s `style`
 * on the inner label does not wipe rAF-driven transform/opacity every render.
 */
export default function ArcadeTitle({ children, className = "" }) {
  const motionRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (inner) inner.style.textShadow = arcadeTextShadow(0, 0);
  }, []);

  useEffect(() => {
    const outer = motionRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      outer.style.transform = "";
      outer.style.opacity = "1";
      inner.style.textShadow = arcadeTextShadow(0, 0);
      return;
    }

    let glitchX = 0;
    let glitchY = 0;
    let glitchUntil = 0;
    let flickerBurstEnd = 0;
    let rafId = 0;
    let startTime = 0;
    let lastFlickerCheck = 0;

    const pickGlitch = () => {
      glitchX = (Math.random() - 0.5) * 7;
      glitchY = (Math.random() - 0.5) * 5;
      glitchUntil = performance.now() + 45 + Math.random() * 70;
    };

    const glitchTimer = window.setInterval(pickGlitch, 2000 + Math.random() * 1800);

    const loop = (now) => {
      if (!startTime) { startTime = now; lastFlickerCheck = now; }
      const elapsed = (now - startTime) / 1000;
      const t = elapsed * 1.26;

      const active = now < glitchUntil;
      const gx = active ? glitchX : 0;
      const gy = active ? glitchY : 0;

      const bx =
        Math.sin(t) * 2.35 + Math.sin(t * 0.37) * 1 + Math.sin(t * 1.7) * 0.35;
      const by = Math.sin(t * 0.73) * 2.85 + Math.cos(t * 0.51) * 0.6;
      const rot = Math.sin(t * 0.41) * 0.78 + Math.sin(t * 1.12) * 0.22;

      outer.style.transform = `translate3d(${bx + gx * 0.28}px, ${by + gy * 0.28}px, 0) rotate(${rot}deg)`;

      const driftX = Math.sin(t * 2.4) * 0.65 + Math.sin(t * 5.2) * 0.35;
      const driftY = Math.cos(t * 1.85) * 0.5;
      inner.style.textShadow = arcadeTextShadow(
        (active ? gx * 1.25 : 0) + driftX,
        (active ? gy * 1.25 : 0) + driftY,
      );

      const dtFlicker = now - lastFlickerCheck;
      if (dtFlicker >= 16.67) {
        lastFlickerCheck = now;
        if (Math.random() < 0.065) {
          flickerBurstEnd = now + 50 + Math.random() * 140;
        }
      }
      const inBurst = now < flickerBurstEnd;
      const shimmer =
        0.94 + 0.055 * Math.sin(t * 23) + 0.028 * Math.sin(t * 57) + 0.015 * Math.sin(t * 91);
      const op = inBurst ? 0.72 + 0.22 * Math.sin(now * 0.125) : shimmer;
      outer.style.opacity = String(Math.max(0.68, Math.min(1, op)));

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.clearInterval(glitchTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <span
      ref={motionRef}
      className={`inline-block origin-center will-change-transform select-none ${className}`}
      style={{
        /* no transform/opacity here — rAF owns them so React never clears them */
        isolation: "isolate",
      }}
    >
      <span ref={innerRef} style={INNER_STYLE}>
        {children}
      </span>
    </span>
  );
}
