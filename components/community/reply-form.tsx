"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/button";

export function ReplyForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/community/threads/${encodeURIComponent(slug)}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not post the reply.");
        setPending(false);
        return;
      }

      setBody("");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check the connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="border border-line bg-[#050505] p-5 md:p-6">
      <label htmlFor="reply-body" className="text-[15px] text-white">
        Join the discussion
      </label>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
        Everyone who started or replied to this thread gets an email. Keep it on topic.
      </p>

      <textarea
        id="reply-body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={5}
        className="mt-4 w-full rounded-md border border-line bg-[#040404] px-3.5 py-3 text-[13.5px] leading-relaxed text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45"
        placeholder="Write a reply…"
      />

      {error ? (
        <div className="mt-3 flex items-start gap-2.5 border border-line px-3.5 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-white">{error}</p>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="t-mono text-faint">{body.trim().length}/4000</p>
        <Button type="submit" disabled={pending || body.trim().length < 2}>
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Posting
            </>
          ) : (
            "Post reply"
          )}
        </Button>
      </div>
    </form>
  );
}
