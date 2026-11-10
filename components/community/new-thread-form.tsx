"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/button";
import { communityCategories } from "@/lib/community";

export function NewThreadForm({ defaultCategory }: { defaultCategory?: string }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory ?? communityCategories[0].slug);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    try {
      const response = await fetch("/api/community/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, body }),
      });
      const result = (await response.json()) as {
        error?: string;
        fields?: Record<string, string>;
        slug?: string;
      };

      if (!response.ok || !result.slug) {
        setError(result.error ?? "Could not publish the discussion.");
        setFields(result.fields ?? {});
        setPending(false);
        return;
      }

      window.location.assign(`/community/t/${result.slug}`);
    } catch {
      setError("Could not reach the server. Check the connection and try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 border border-line bg-[#050505] p-5 md:p-8">
      <div>
        <label htmlFor="thread-title" className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted">
          Title
        </label>
        <input
          id="thread-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={fields.title ? true : undefined}
          className="h-11 w-full rounded-md border border-line bg-[#040404] px-3.5 text-[14px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45"
          placeholder="Ask the question you would ask a colleague"
        />
        {fields.title ? <p className="mt-1.5 text-[11.5px] text-white">{fields.title}</p> : null}
      </div>

      <div className="mt-5">
        <label htmlFor="thread-category" className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted">
          Category
        </label>
        <select
          id="thread-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 w-full rounded-md border border-line bg-[#040404] px-3 text-[13.5px] text-white outline-none transition-colors focus:border-white/45"
        >
          {communityCategories.map((entry) => (
            <option key={entry.slug} value={entry.slug} className="bg-[#0a0a0a]">
              {entry.name}
            </option>
          ))}
        </select>
        {fields.category ? <p className="mt-1.5 text-[11.5px] text-white">{fields.category}</p> : null}
      </div>

      <div className="mt-5">
        <label htmlFor="thread-body" className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted">
          Details
        </label>
        <textarea
          id="thread-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={10}
          aria-invalid={fields.body ? true : undefined}
          className="w-full rounded-md border border-line bg-[#040404] px-3.5 py-3 text-[13.5px] leading-relaxed text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45"
          placeholder="What you tried, what happened, and what you need. Blank lines separate paragraphs."
        />
        {fields.body ? <p className="mt-1.5 text-[11.5px] text-white">{fields.body}</p> : null}
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2.5 border border-line px-3.5 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-white">{error}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-sm text-[11.5px] leading-relaxed text-faint">
          Your name and handle are public. Do not post live vulnerabilities or other people&apos;s
          personal data.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Publishing
            </>
          ) : (
            "Publish discussion"
          )}
        </Button>
      </div>
    </form>
  );
}
