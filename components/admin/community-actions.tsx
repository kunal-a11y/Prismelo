"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Pending = null | "lock" | "pin" | "delete";

async function call(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const result = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Request failed.");
}

export function ThreadAdminActions({
  id,
  title,
  locked,
  pinned,
}: {
  id: string;
  title: string;
  locked: boolean;
  pinned: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, boolean>, kind: "lock" | "pin") {
    setPending(kind);
    setError(null);
    try {
      await call(`/api/admin/community/threads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed.");
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      `Delete “${title}” and all of its replies? This cannot be undone.`,
    );
    if (!confirmed) return;

    setPending("delete");
    setError(null);
    try {
      await call(`/api/admin/community/threads/${encodeURIComponent(id)}`, { method: "DELETE" });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => patch({ locked: !locked }, "lock")}
        disabled={pending !== null}
        className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-white disabled:opacity-50"
      >
        {pending === "lock" ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : null}
        {locked ? "Unlock" : "Lock"}
      </button>
      <button
        type="button"
        onClick={() => patch({ pinned: !pinned }, "pin")}
        disabled={pending !== null}
        className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-white disabled:opacity-50"
      >
        {pending === "pin" ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : null}
        {pinned ? "Unpin" : "Pin"}
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

export function DeleteButton({
  url,
  confirmText,
  label = "Delete",
}: {
  url: string;
  confirmText: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm(confirmText)) return;
    setPending(true);
    setError(null);
    try {
      await call(url, { method: "DELETE" });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-[11.5px] text-faint transition-colors hover:text-white disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : null}
        {label}
      </button>
      {error ? <span className="text-[11.5px] text-white">{error}</span> : null}
    </span>
  );
}
