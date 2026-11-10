"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/button";
import { safeNextPath } from "@/lib/request";

type Mode = "login" | "register";

export function CommunityAuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const uid = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const isRegister = mode === "register";
  // Only same-site paths are allowed; `//evil.example` is a URL, not a path.
  const target = safeNextPath(next);
  const alternateHref =
    target !== "/community"
      ? `${isRegister ? "/community/login" : "/community/register"}?next=${encodeURIComponent(target)}`
      : isRegister
        ? "/community/login"
        : "/community/register";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    try {
      const response = await fetch(`/api/community/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const result = (await response.json()) as {
        error?: string;
        fields?: Record<string, string>;
      };

      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Try again.");
        setFields(result.fields ?? {});
        setPending(false);
        return;
      }

      // Hard navigation: the header and community pages render the session
      // state on the server, so a client-router push could show stale chrome.
      window.location.assign(target);
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
      <h2 className="text-[15px] text-white">{isRegister ? "Create an account" : "Sign in"}</h2>
      <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
        {isRegister
          ? "Your handle is public. Your email address is never shown on the site."
          : "Use the email and password you registered with."}
      </p>

      {isRegister ? (
        <div className="mt-6">
          <label
            htmlFor={`${uid}-name`}
            className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
          >
            Name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={fields.name ? true : undefined}
            className="h-11 w-full rounded-md border border-line bg-[#050505] px-3.5 text-[14px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45"
            placeholder="Your name"
          />
          {fields.name ? <p className="mt-1.5 text-[11.5px] text-white">{fields.name}</p> : null}
        </div>
      ) : null}

      <div className="mt-5">
        <label
          htmlFor={`${uid}-email`}
          className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
        >
          Email
        </label>
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fields.email ? true : undefined}
          className="h-11 w-full rounded-md border border-line bg-[#050505] px-3.5 text-[14px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45"
          placeholder="you@example.com"
        />
        {fields.email ? <p className="mt-1.5 text-[11.5px] text-white">{fields.email}</p> : null}
      </div>

      <div className="mt-5">
        <label
          htmlFor={`${uid}-password`}
          className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted"
        >
          Password
        </label>
        <input
          id={`${uid}-password`}
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={fields.password ? true : undefined}
          className="h-11 w-full rounded-md border border-line bg-[#050505] px-3.5 text-[14px] text-white outline-none transition-colors placeholder:text-[#565656] focus:border-white/45"
          placeholder={isRegister ? "At least 8 characters" : "Password"}
        />
        {fields.password ? (
          <p className="mt-1.5 text-[11.5px] text-white">{fields.password}</p>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2.5 border border-line px-3.5 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-white">{error}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[11.5px] leading-relaxed text-faint">
          {isRegister
            ? "You'll get an email when a new article is published and when someone replies to your discussions."
            : "Sessions last 30 days on this device."}
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              {isRegister ? "Creating" : "Signing in"}
            </>
          ) : isRegister ? (
            "Create account"
          ) : (
            "Sign in"
          )}
        </Button>
      </div>

      <p className="mt-6 border-t border-line pt-4 text-[12px] text-muted">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href={alternateHref} className="u-link text-white">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account yet?{" "}
            <Link href={alternateHref} className="u-link text-white">
              Create one
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
