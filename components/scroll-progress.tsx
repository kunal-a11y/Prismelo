"use client";

import { useEffect, useRef } from "react";

/**
 * Hairline read-out of page progress, pinned to the bottom edge of the header.
 * Scroll work is coalesced into one animation frame and the bar is driven with
 * a transform, so it never triggers layout.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const paint = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span aria-hidden="true" className="scroll-progress">
      <span ref={bar} className="scroll-progress__bar" />
    </span>
  );
}
