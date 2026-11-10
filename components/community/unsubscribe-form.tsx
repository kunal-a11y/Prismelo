"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/button";

export function UnsubscribeForm({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit() {
    setStatus("pending");
    try {
      const response = await fetch("/api/subscribe/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(result.error ?? "Could not unsubscribe.");
        return;
      }
      setStatus("done");
      setMessage("You will not receive any more article emails.");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Try again.");
    }
  }

  if (status === "done") {
    return (
      <p className="mt-6 border border-line px-4 py-3 text-[13px] leading-relaxed text-white">
        {message}
      </p>
    );
  }

  return (
    <div className="mt-6">
      <Button onClick={submit} disabled={status === "pending"} variant="secondary">
        {status === "pending" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Unsubscribing
          </>
        ) : (
          "Unsubscribe"
        )}
      </Button>
      {status === "error" ? (
        <p className="mt-3 text-[12px] leading-relaxed text-white">{message}</p>
      ) : null}
    </div>
  );
}
