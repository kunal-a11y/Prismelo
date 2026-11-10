import { NextResponse } from "next/server";
import {
  COMMUNITY_COOKIE,
  communityAuthConfigured,
  communitySessionCookieOptions,
  createCommunitySessionToken,
  hashPassword,
  verifyPassword,
} from "@/lib/community-auth";
import { findUserByEmail, normalizeEmail, readStore } from "@/lib/community-store";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 2000) attempts.clear();
  return recent.length > MAX_ATTEMPTS;
}

// Hashing a throwaway value for unknown emails keeps the response time close to
// a real password check, so the endpoint does not reveal which emails exist.
let decoyHash: string | null = null;
function decoy() {
  decoyHash ??= hashPassword("decoy-password-never-matches");
  return decoyHash;
}

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

  const email = normalizeEmail(String(payload.email ?? ""));
  const password = typeof payload.password === "string" ? payload.password : "";
  const user = findUserByEmail(readStore(), email);

  // One message for both branches: no account enumeration.
  if (!user) {
    verifyPassword(password, decoy());
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  attempts.delete(key);

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
