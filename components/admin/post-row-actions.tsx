"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function PostRowActions({
  slug,
  draft,
  title,
}: {
  slug: string;
  draft: boolean;
  title: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<null | "toggle" | "delete">(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setPending("toggle");
    setError(null);
    try {
      const response = await fetch(`/api/admin/resources/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: !draft }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Could not update the post.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      `Delete “${title}”? The file is removed permanently.`,
    );
    if (!confirmed) return;

    setPending("delete");
    setError(null);
    try {
      const response = await fetch(`/api/admin/resources/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Could not delete the post.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={pending !== null}
        className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-white disabled:opacity-50"
      >
        {pending === "toggle" ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : null}
        {draft ? "Publish" : "Unpublish"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={pending !== null}
        className="inline-flex items-center gap-1.5 text-[11.5px] text-faint transition-colors hover:text-white disabled:opacity-50"
      >
        {pending === "delete" ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : null}
        Delete
      </button>
      {error ? <span className="text-[11.5px] text-white">{error}</span> : null}
    </div>
  );
}
