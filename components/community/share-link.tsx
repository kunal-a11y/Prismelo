"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export function ShareLink() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[11.5px] text-muted transition-colors hover:border-white/40 hover:text-white"
    >
      {copied ? (
        <Check className="h-3 w-3" aria-hidden="true" />
      ) : (
        <Link2 className="h-3 w-3" aria-hidden="true" />
      )}
      {copied ? "Link copied" : "Copy link"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Discussion link copied to clipboard" : ""}
      </span>
    </button>
  );
}
