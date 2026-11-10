"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function LegalNotifyForm({
  legalKey,
  label,
  changed,
  subscriberCount,
}: {
  legalKey: "privacy" | "terms";
  label: string;
  changed: boolean;
  subscriberCount: number;
}) {
  const uid = useId();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<null | "notify" | "record">(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(mode: "notify" | "record") {
    if (mode === "notify") {
      const confirmed = window.confirm(
        `Email ${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"} about the ${label} update?`,
      );
      if (!confirmed) return;
    }

    setPending(mode);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/notify-legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: legalKey, mode, note }),
      });
      const result = (await response.json()) as { error?: string; sent?: number };

      if (!response.ok) {
        setError(result.error ?? "Could not complete that.");
        return;
      }

      setMessage(
        mode === "record"
          ? "Recorded the current version. Nobody was emailed."
          : result.sent
            ? `Notice sent to ${result.sent} subscriber${result.sent === 1 ? "" : "s"}.`
            : "No subscribers yet, so no email was sent. The version is recorded.",
      );
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-4">
      <label
        htmlFor={`${uid}-note`}
        className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
      >
        One-line summary (optional)
      </label>
      <input
        id={`${uid}-note`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={300}
        placeholder="What changed, in one sentence."
        className="h-10 w-full rounded-md border border-line bg-[#040404] px-3 text-[13px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45"
      />
      <p className="mt-2 text-[11px] leading-relaxed text-faint">
        Included at the top of the email. Leave it blank to send the default wording.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => submit("notify")}
          disabled={pending !== null}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-[12.5px] font-medium text-black transition-colors hover:bg-[#e2e2e2] disabled:opacity-50"
        >
          {pending === "notify" ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : null}
          Email subscribers
        </button>
        <button
          type="button"
          onClick={() => submit("record")}
          disabled={pending !== null}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[12.5px] text-white transition-colors hover:border-white/45 disabled:opacity-50"
        >
          {pending === "record" ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : null}
          {changed ? "Mark as seen without emailing" : "Record current version"}
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-[12px] leading-relaxed text-white">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-[12px] leading-relaxed text-[#ffbf66]">{error}</p>
      ) : null}
    </div>
  );
}
