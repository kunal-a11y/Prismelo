"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", cache: "no-store" });
    } catch {
      // The navigation below still re-checks the session on the server, so a
      // failed request here cannot leave a stale admin page on screen.
    }
    // Hard navigation: it drops the client router cache, including any cached
    // admin pages, instead of re-rendering them from memory.
    window.location.assign("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-white disabled:opacity-50"
    >
      <LogOut className="h-3 w-3" aria-hidden="true" />
      {pending ? "Signing out" : "Sign out"}
    </button>
  );
}
