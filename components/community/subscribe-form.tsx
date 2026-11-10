"use client";

import { useId, useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

/**
 * Email sign-up for new articles. Nothing is collected from a visitor unless
 * they type an address here and submit it — the site cannot see an email
 * address any other way.
 */
export function SubscribeForm({ className }: { className?: string }) {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("pending");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(result.error ?? "Could not subscribe. Try again.");
        return;
      }

      setStatus("done");
      setMessage("You're on the list. New articles will arrive by email.");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Check the connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div className={className}>
        <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-white">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {message}
        </p>
        <p className="mt-2 text-[11.5px] leading-relaxed text-faint">
          Every email includes an unsubscribe link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      <label htmlFor={`${uid}-email`} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`${uid}-email`}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 text-[13.5px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45"
        />
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
          <label htmlFor={`${uid}-website`}>Website</label>
          <input
            id={`${uid}-website`}
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={status === "pending"}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-[13px] font-medium text-black transition-colors hover:bg-[#e2e2e2] disabled:opacity-50"
        >
          {status === "pending" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Subscribing
            </>
          ) : (
            "Notify me"
          )}
        </button>
      </div>

      {status === "error" ? (
        <p className="mt-2 flex items-start gap-2 text-[12px] leading-relaxed text-white">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {message}
        </p>
      ) : null}
    </form>
  );
}
