"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/button";

export function LoginForm() {
  const router = useRouter();
  const uid = useId();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password) {
      setError("Enter the admin password.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not sign in.");
        setPending(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check the connection and try again.");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-8 border border-line bg-[#040404] p-6 text-left md:p-8"
    >
      <div className="flex items-center gap-2.5">
        <Lock className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
        <h2 className="text-[15px] text-white">Sign in</h2>
      </div>

      <div className="mt-6">
        <label
          htmlFor={`${uid}-password`}
          className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
        >
          Admin password
        </label>
        <input
          id={`${uid}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${uid}-error` : undefined}
          className="h-11 w-full rounded-md border border-line bg-[#050505] px-3.5 text-[14px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45 aria-[invalid=true]:border-white/70"
          placeholder="Password"
        />
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2.5 border border-line px-3.5 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
          <p id={`${uid}-error`} className="text-[12px] leading-relaxed text-white">
            {error}
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-[11.5px] text-faint">
          Sessions last eight hours on this device.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>
    </form>
  );
}
