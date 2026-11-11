import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  findUserById,
  readStore,
  type StoredUser,
} from "@/lib/community-store";
import { communityApi } from "@/lib/community-cloudflare";

/**
 * Community accounts: email + password, stored as a scrypt hash in the forum
 * data file. A signed, HttpOnly cookie carries the user id — the browser never
 * says who it is, the signature does.
 *
 * Signing key precedence: COMMUNITY_SESSION_SECRET, then ADMIN_SESSION_SECRET,
 * then ADMIN_PASSWORD. With none of those set, accounts are disabled rather
 * than falling back to a guessable key.
 */

export const COMMUNITY_COOKIE = "prismelo_community";
export const COMMUNITY_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const KEY_LENGTH = 64;

function sessionSecret() {
  return (
    process.env.COMMUNITY_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    ""
  );
}

export function communityAuthConfigured() {
  return sessionSecret().length > 0;
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("base64url");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const given = crypto.scryptSync(password, salt, KEY_LENGTH);
  const wanted = Buffer.from(hash, "base64url");
  if (given.length !== wanted.length) return false;
  return crypto.timingSafeEqual(given, wanted);
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
}

export function createCommunitySessionToken(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + COMMUNITY_SESSION_MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyCommunitySessionToken(token: string | undefined) {
  if (!token || !communityAuthConfigured()) return null;

  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;

  const given = Buffer.from(mac);
  const wanted = Buffer.from(sign(payload));
  if (given.length !== wanted.length) return null;
  if (!crypto.timingSafeEqual(given, wanted)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      uid?: unknown;
      exp?: unknown;
    };
    if (typeof parsed.uid !== "string") return null;
    if (typeof parsed.exp !== "number" || parsed.exp <= Date.now()) return null;
    return { userId: parsed.uid };
  } catch {
    return null;
  }
}

/** The signed-in community member for this request, or null. */
export type CommunityUser = StoredUser;

export async function currentCommunityUser(): Promise<CommunityUser | null> {
  const response = await communityApi("/api/community/me", true);
  if (response) {
    if (!response.ok) return null;
    const result = (await response.json()) as {
      user?: { id: string; username: string; name: string; bio: string; createdAt: string };
    };
    return result.user
      ? { ...result.user, email: "", passwordHash: "" }
      : null;
  }

  // Keep the local file-backed flow available when running `next dev`.
  const store = await cookies();
  const session = verifyCommunitySessionToken(store.get(COMMUNITY_COOKIE)?.value);
  if (!session) return null;
  return findUserById(readStore(), session.userId);
}

export function communitySessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COMMUNITY_SESSION_MAX_AGE,
  };
}

/** A public handle: display name or email prefix, made unique. */
export function uniqueUsername(store: { users: StoredUser[] }, name: string, email: string) {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) ||
    email.split("@")[0]?.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) ||
    "member";

  const taken = new Set(store.users.map((user) => user.username));
  if (!taken.has(base)) return base;

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${crypto.randomBytes(3).toString("hex")}`;
}
