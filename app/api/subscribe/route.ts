import { NextResponse, after } from "next/server";
import {
  newId,
  newSubscriberToken,
  normalizeEmail,
  readStore,
  updateStore,
  type StoredSubscriber,
} from "@/lib/community-store";
import { sendSubscriptionConfirmation } from "@/lib/notify";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > MAX_ATTEMPTS;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(key)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a few minutes." },
      { status: 429 },
    );
  }

  const parsed = await readJsonBody(request, 4 * 1024);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const payload = parsed.data;

  // Honeypot, same pattern as the contact form.
  if (typeof payload.website === "string" && payload.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(String(payload.email ?? ""));
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address.", fields: { email: "That email does not look right." } },
      { status: 400 },
    );
  }

  const existing = readStore().subscribers.find((entry) => entry.email === email);

  // Same answer whether or not the address was already on the list: the
  // endpoint must not become a way to test who is subscribed.
  if (existing && !existing.unsubscribedAt) {
    return NextResponse.json({ ok: true });
  }

  let subscriber: StoredSubscriber;
  if (existing) {
    subscriber = updateStore((store) => {
      const found = store.subscribers.find((entry) => entry.email === email)!;
      found.unsubscribedAt = null;
      return found;
    });
  } else {
    subscriber = {
      id: newId("sub"),
      email,
      source: "resources",
      token: newSubscriberToken(),
      createdAt: new Date().toISOString(),
      unsubscribedAt: null,
    };
    updateStore((store) => {
      store.subscribers.push(subscriber);
    });
  }

  const origin = new URL(request.url).origin;
  after(async () => {
    await sendSubscriptionConfirmation(subscriber, origin);
  });

  return NextResponse.json({ ok: true });
}
