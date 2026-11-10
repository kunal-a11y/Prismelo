"use client";

import { useEffect } from "react";

/**
 * One passive pointer listener for every `[data-spotlight]` surface. It only
 * writes CSS custom properties (coalesced to a frame), so the glow follows the
 * cursor without touching React state or causing re-renders.
 */
export function SpotlightPointer() {
  useEffect(() => {
    let frame = 0;
    let event: PointerEvent | null = null;
    let active: HTMLElement | null = null;

    const write = (target: HTMLElement, next: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      target.style.setProperty(
        "--mx",
        `${((next.clientX - rect.left) / rect.width) * 100}%`,
      );
      target.style.setProperty(
        "--my",
        `${((next.clientY - rect.top) / rect.height) * 100}%`,
      );
    };

    const apply = () => {
      frame = 0;
      if (active && event) write(active, event);
    };

    const onPointerMove = (next: PointerEvent) => {
      const target = (next.target as Element | null)?.closest?.(
        "[data-spotlight]",
      ) as HTMLElement | null;

      if (target !== active) {
        active = target;
        if (target) write(target, next);
      }

      event = next;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
