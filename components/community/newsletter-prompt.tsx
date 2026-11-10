"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { SubscribeForm } from "@/components/community/subscribe-form";

const STORAGE_KEY = "prismelo-article-emails-dismissed";
const DELAY_MS = 12_000;

/**
 * A single, dismissible offer to receive new articles by email.
 *
 * It appears once per browser, only on public pages, and it asks for an address
 * — nothing is collected from a visitor who ignores it. Sites cannot read an
 * email address from a visit, so this is the honest version of "capture".
 */
export function NewsletterPrompt() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hiddenRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/unsubscribe");

  useEffect(() => {
    if (hiddenRoute) return;
    if (typeof window === "undefined") return;

    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hiddenRoute]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Storage may be blocked; the prompt simply returns on the next visit.
    }
  }

  if (!open || hiddenRoute) return null;

  return (
    <aside
      aria-label="New articles by email"
      className="fixed bottom-4 right-4 z-[60] w-[min(360px,calc(100vw-2rem))] border border-line bg-[#070707] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-faint transition-colors hover:text-white"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <p className="t-mono text-faint">PRISMELO / EMAIL</p>
      <h2 className="mt-2 pr-6 text-[15px] leading-snug text-white">
        New articles, by email.
      </h2>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
        One email when something new is published. No tracking, no newsletter, unsubscribe
        any time.
      </p>

      <SubscribeForm className="mt-4" />

      <button
        type="button"
        onClick={dismiss}
        className="mt-3 text-[11.5px] text-faint transition-colors hover:text-white"
      >
        No thanks
      </button>
    </aside>
  );
}
