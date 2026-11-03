import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Presentation only: never changes the value used by financial calculations. */
export function AnimatedNumber({ value }: { value: string | number }) {
  const text = String(value);
  const match = text.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  const target = match ? Number(match[1]) : null;
  const decimals = match?.[1]?.split(".")[1]?.length ?? 0;
  const suffix = match?.[2] ?? "";
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(target ?? 0);
  const previous = useRef(0);

  useEffect(() => {
    if (target === null) return;
    if (reducedMotion) { previous.current = target; setDisplay(target); return; }
    const from = previous.current;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 650);
      const next = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      previous.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reducedMotion]);

  return <span className="tabular-nums" aria-label={text}><span aria-hidden="true">{target === null ? text : `${(reducedMotion ? target : display).toFixed(decimals)}${suffix}`}</span></span>;
}