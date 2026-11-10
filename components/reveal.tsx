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

/**
 * False until the first page has rendered. After that, any newly mounted
 * reveal comes from a client-side navigation, where content already in view
 * should appear immediately rather than fade in again.
 *
 * `PagePaintMarker` flips it from a layout effect that runs after the page's
 * own effects, so the first page still animates in and later ones do not.
 */
let pagePainted = false;

export function markPagePainted() {
  pagePainted = true;
}

/** Mounted once in the root layout, after the page content in tree order. */
export function PagePaintMarker() {
  useEffect(() => {
    markPagePainted();
  }, []);
  return null;
}

function inViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

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
  const [instant, setInstant] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Arrived by navigating here, already on screen: no reveal needed.
    if (pagePainted && inViewport(node)) {
      setInstant(true);
      setShown(true);
      return;
    }

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
      className={cn(
        "reveal",
        shown && "reveal--in",
        instant && "reveal--instant",
        className,
      )}
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
  const [instant, setInstant] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (pagePainted) {
      setInstant(true);
      setShown(true);
      return;
    }

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
      className={cn(
        "fade-in",
        shown && "fade-in--in",
        instant && "fade-in--instant",
        className,
      )}
      style={{ transitionDelay: delay ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}
