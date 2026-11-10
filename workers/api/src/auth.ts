/**
 * Passwords and sessions, using only WebCrypto so this runs unchanged in a
 * Worker.
 *
 * Passwords are PBKDF2-SHA256 (210k iterations) with a random salt. The Next
 * version used scrypt, which does not exist outside Node; existing scrypt
 * hashes therefore cannot be verified here and would need a password reset.
 * The data file held no accounts when this was written, so nothing is lost.
 *
 * Sessions are signed tokens, not database rows: `base64url(payload).base64url(hmac)`
 * with the same payload shape the Next app uses, so a token minted on either
 * side verifies on the other when the secret matches. Nothing in the payload is
 * trusted until the signature matches.
 */

import type { Env } from "./http";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const ADMIN_COOKIE = "prismelo_admin";
export const COMMUNITY_COOKIE = "prismelo_community";
export const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 hours
export const COMMUNITY_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const PBKDF2_ITERATIONS = 210_000;
const KEY_BYTES = 32;

export function b64urlFromBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function bytesFromB64url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function b64urlFromString(value: string): string {
  return b64urlFromBytes(encoder.encode(value));
}

export function stringFromB64url(value: string): string {
  return decoder.decode(bytesFromB64url(value));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

/* ------------------------------------------------------------------ passwords */

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    KEY_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2:${PBKDF2_ITERATIONS}:${b64urlFromBytes(salt)}:${b64urlFromBytes(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split(":");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;
  const rounds = Number(iterations);
  if (!Number.isInteger(rounds) || rounds < 10_000) return false;

  const candidate = await derive(password, bytesFromB64url(salt), rounds);
  return constantTimeEqual(candidate, bytesFromB64url(hash));
}

/* ------------------------------------------------------------------- sessions */

const hmacKeys = new Map<string, Promise<CryptoKey>>();

function hmacKey(secret: string): Promise<CryptoKey> {
  const cached = hmacKeys.get(secret);
  if (cached) return cached;
  const key = crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  hmacKeys.set(secret, key);
  return key;
}

async function sign(secret: string, payload: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(payload));
  return b64urlFromBytes(new Uint8Array(signature));
}

export function adminConfigured(env: Env): boolean {
  return Boolean(env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length > 0);
}

function adminSecret(env: Env): string {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || "";
}

function communitySecret(env: Env): string {
  return env.COMMUNITY_SESSION_SECRET || env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || "";
}

export function communityConfigured(env: Env): boolean {
  return communitySecret(env).length > 0;
}

async function mint(secret: string, payload: Record<string, unknown>): Promise<string> {
  const body = b64urlFromString(JSON.stringify(payload));
  return `${body}.${await sign(secret, body)}`;
}

async function read(secret: string, token: string | undefined | null): Promise<Record<string, unknown> | null> {
  if (!token || !secret) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;

  const expected = await sign(secret, body);
  if (!constantTimeEqual(encoder.encode(mac), encoder.encode(expected))) return null;

  try {
    const parsed = JSON.parse(stringFromB64url(body)) as Record<string, unknown>;
    if (typeof parsed.exp !== "number" || parsed.exp <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createAdminToken(env: Env): Promise<string> {
  return mint(adminSecret(env), { exp: Date.now() + ADMIN_MAX_AGE * 1000 });
}

export async function verifyAdminToken(env: Env, token: string | undefined | null): Promise<boolean> {
  if (!adminConfigured(env)) return false;
  return (await read(adminSecret(env), token)) !== null;
}

export function createCommunityToken(env: Env, userId: string): Promise<string> {
  return mint(communitySecret(env), { uid: userId, exp: Date.now() + COMMUNITY_MAX_AGE * 1000 });
}

export async function verifyCommunityToken(env: Env, token: string | undefined | null): Promise<string | null> {
  if (!communityConfigured(env)) return null;
  const payload = await read(communitySecret(env), token);
  return payload && typeof payload.uid === "string" ? payload.uid : null;
}

/* -------------------------------------------------------------------- cookies */

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Bearer token first (works from any origin), then the cookie (same-site). */
export function requestToken(request: Request, cookieName: string): string | null {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();
    if (token) return token;
  }
  return readCookie(request, cookieName);
}

export function sessionCookie(env: Env, name: string, token: string, maxAge: number): string {
  const parts = [
    `${name}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${maxAge}`,
  ];
  // Only set when the API and the site share a registrable domain
  // (api.prismelo.tech + prismelo.tech). On workers.dev this stays empty,
  // and the frontend uses the Bearer token instead.
  if (env.COOKIE_DOMAIN) parts.push(`Domain=${env.COOKIE_DOMAIN}`);
  return parts.join("; ");
}

export function clearCookie(env: Env, name: string): string {
  const parts = [`${name}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Secure", "Max-Age=0"];
  if (env.COOKIE_DOMAIN) parts.push(`Domain=${env.COOKIE_DOMAIN}`);
  return parts.join("; ");
}

/* ------------------------------------------------------------------ usernames */

export function slugify(value: string, fallback = "member"): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || fallback;
}
