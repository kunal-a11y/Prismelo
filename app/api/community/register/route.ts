import { NextResponse, after } from "next/server";
import {
  COMMUNITY_COOKIE,
  communityAuthConfigured,
  communitySessionCookieOptions,
  createCommunitySessionToken,
  hashPassword,
  uniqueUsername,
} from "@/lib/community-auth";
import {
  findUserByEmail,
  newId,
  newSubscriberToken,
  normalizeEmail,
  readStore,
  updateStore,
  type StoredUser,
} from "@/lib/community-store";
import { notifyWelcome } from "@/lib/notify";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const attempts = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 2000) attempts.clear();
  return recent.length > MAX_ATTEMPTS;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!communityAuthConfigured()) {
    return NextResponse.json(
      { error: "Community accounts are not enabled on this server." },
      { status: 503 },
    );
  }

  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(key)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const payload = parsed.data;

  // Honeypot: accept silently so bots do not learn the check exists.
  if (typeof payload.website === "string" && payload.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = String(payload.name ?? "").trim();
  const email = normalizeEmail(String(payload.email ?? ""));
  const password = typeof payload.password === "string" ? payload.password : "";

  const fields: Record<string, string> = {};
  if (name.length < 2 || name.length > 60) fields.name = "Use your name or handle (2–60 characters).";
  if (!EMAIL_PATTERN.test(email)) fields.email = "Enter a valid email address.";
  if (password.length < 8) fields.password = "Use at least 8 characters.";

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields }, { status: 400 });
  }

  const existing = findUserByEmail(readStore(), email);
  if (existing) {
    return NextResponse.json(
      {
        error: "An account already uses that email. Sign in instead.",
        fields: { email: "That email is already registered." },
      },
      { status: 409 },
    );
  }

  const user: StoredUser = {
    id: newId("user"),
    username: uniqueUsername(readStore(), name, email),
    name,
    email,
    passwordHash: hashPassword(password),
    bio: "",
    createdAt: new Date().toISOString(),
  };

  updateStore((store) => {
    store.users.push(user);
    const subscriber = store.subscribers.find((entry) => entry.email === email);
    if (subscriber) {
      subscriber.unsubscribedAt = null;
    } else {
      store.subscribers.push({
        id: newId("sub"),
        email,
        source: "community",
        token: newSubscriberToken(),
        createdAt: new Date().toISOString(),
        unsubscribedAt: null,
      });
    }
  });

  const origin = new URL(request.url).origin;
  after(async () => {
    await notifyWelcome(user, origin);
  });

  const response = NextResponse.json({
    ok: true,
    user: { username: user.username, name: user.name },
  });
  response.cookies.set(
    COMMUNITY_COOKIE,
    createCommunitySessionToken(user.id),
    communitySessionCookieOptions(),
  );
  return response;
}
