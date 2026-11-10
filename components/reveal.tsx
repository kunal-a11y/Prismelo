"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * IntersectionObserver callbacks only run while the page is painting, so a
 * backgrounded or prerendered document can keep content invisible. Every
 * mounted reveal also joins one shared timer sweep that checks positions
 * directly; it stops as soon as nothing is waiting.
 */
type Pending = { node: HTMLElement; show: () => void };

const pending = new Set<Pending>();
let ticker: number | undefined;

function stopTicker() {
  if (ticker !== undefined) {
    window.clearInterval(ticker);
    ticker = undefined;
  }
}

function sweep() {
  for (const item of pending) {
    const rect = item.node.getBoundingClientRect();
    if (rect.top < window.innerHeight + 70 && rect.bottom > -70) {
      item.show();
      pending.delete(item);
    }
  }
  if (pending.size === 0) stopTicker();
}

function track(node: HTMLElement, show: () => void) {
  const item = { node, show };
  pending.add(item);
  if (ticker === undefined) ticker = window.setInterval(sweep, 350);
  return () => {
    pending.delete(item);
    if (pending.size === 0) stopTicker();
  };
}

/**
 * Scroll reveal without an animation library: an IntersectionObserver flips a
 * class and CSS does the transition. Reduced-motion users get the final state
 * immediately (see the media query in globals.css).
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { rootMargin: "0px 0px -70px 0px" },
    );

    observer.observe(node);
    const untrack = track(node, () => setShown(true));
    return () => {
      observer.disconnect();
      untrack();
    };
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn("reveal", shown && "reveal--in", className)}
      style={
        {
          "--reveal-y": `${y}px`,
          transitionDelay: delay ? `${delay}s` : undefined,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/** Fade in as soon as it mounts — used above the fold. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(true));
    // rAF is starved in hidden tabs, so guarantee the fade completes anyway.
    const timer = window.setTimeout(() => setShown(true), 300);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={cn("fade-in", shown && "fade-in--in", className)}
      style={{ transitionDelay: delay ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}
