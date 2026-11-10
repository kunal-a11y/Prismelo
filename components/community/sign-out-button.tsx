"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export function CommunitySignOutButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await fetch("/api/community/logout", { method: "POST", cache: "no-store" });
    } catch {
      // The hard navigation below re-checks the session on the server.
    }
    window.location.assign("/community");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className={
        className ??
        "inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-white disabled:opacity-50"
      }
    >
      <LogOut className="h-3 w-3" aria-hidden="true" />
      {pending ? "Signing out" : "Sign out"}
    </button>
  );
}
