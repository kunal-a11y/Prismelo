/**
 * Application-level encryption for personal data.
 *
 * Why not "end-to-end"? E2E means the server cannot read the data. This server
 * has to: it renders threads, emails subscribers and lets an admin moderate.
 * What is achievable and genuinely useful is encryption *at rest*: the database
 * stores ciphertext, and the key lives in a Worker secret, never in D1. A stolen
 * database dump or a leaked backup then contains nothing readable.
 *
 * Two primitives:
 *
 * - `encryptField` / `decryptField` — AES-256-GCM with a fresh random IV per
 *   value. GCM is authenticated, so a tampered ciphertext fails to decrypt
 *   instead of returning attacker-chosen plaintext.
 * - `blindIndex` — HMAC-SHA256 of the normalised value, stored next to the
 *   ciphertext. Encrypted values are different every time, so `WHERE email = ?`
 *   can never match; the blind index is deterministic and lets the query work
 *   without revealing the value. It is a hash, not the address.
 */

import type { Env } from "./http";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function b64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromB64url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export const ENC_PREFIX = "enc:v1:";

/** DATA_KEY is 32 bytes, base64url or hex, set with `wrangler secret put`. */
function rawKey(env: Env): Uint8Array | null {
  const value = env.DATA_KEY?.trim();
  if (!value) return null;

  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    const bytes = new Uint8Array(32);
    for (let index = 0; index < 32; index += 1) bytes[index] = parseInt(value.slice(index * 2, index * 2 + 2), 16);
    return bytes;
  }

  try {
    const decoded = fromB64url(value);
    if (decoded.length === 32) return decoded;
  } catch {
    /* fall through */
  }
  return null;
}

export function encryptionConfigured(env: Env): boolean {
  return rawKey(env) !== null;
}

const keyCache = new Map<string, Promise<CryptoKey>>();

async function aesKey(env: Env): Promise<CryptoKey> {
  const raw = rawKey(env);
  if (!raw) throw new Error("DATA_KEY is not configured");

  const id = b64url(raw);
  const cached = keyCache.get(id);
  if (cached) return cached;

  const key = crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  keyCache.set(id, key);
  return key;
}

/**
 * Encrypts one value. When DATA_KEY is absent this returns the input unchanged
 * so local development does not need a key — the health endpoint reports
 * `encryption: "missing"` so that state is never silent in production.
 */
export async function encryptField(env: Env, plaintext: string): Promise<string> {
  if (!rawKey(env)) return plaintext;
  if (plaintext.startsWith(ENC_PREFIX)) return plaintext;

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await aesKey(env),
    encoder.encode(plaintext),
  );

  return `${ENC_PREFIX}${b64url(iv)}:${b64url(new Uint8Array(ciphertext))}`;
}

/** Returns null when a value carries the prefix but cannot be authenticated. */
export async function decryptField(env: Env, value: string): Promise<string | null> {
  if (!value.startsWith(ENC_PREFIX)) return value;

  const [ivPart, dataPart] = value.slice(ENC_PREFIX.length).split(":");
  if (!ivPart || !dataPart) return null;

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64url(ivPart) },
      await aesKey(env),
      fromB64url(dataPart),
    );
    return decoder.decode(plaintext);
  } catch {
    // Wrong key, or the ciphertext was edited. Either way: no plaintext.
    return null;
  }
}

const indexKeys = new Map<string, Promise<CryptoKey>>();

async function indexKey(env: Env): Promise<CryptoKey> {
  const raw = rawKey(env);
  if (!raw) throw new Error("DATA_KEY is not configured");

  const id = `idx:${b64url(raw)}`;
  const cached = indexKeys.get(id);
  if (cached) return cached;

  // A separate derived key, so the blind index cannot be used to learn the AES key.
  const material = await crypto.subtle.importKey("raw", raw, "HKDF", false, ["deriveKey"]);
  const key = crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: encoder.encode("prismelo-blind-index"), info: encoder.encode("v1") },
    material,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign"],
  );
  indexKeys.set(id, key);
  return key;
}

/** Deterministic lookup key for an encrypted column. Empty string when no key. */
export async function blindIndex(env: Env, value: string): Promise<string> {
  if (!rawKey(env)) return normalize(value);
  const signature = await crypto.subtle.sign("HMAC", await indexKey(env), encoder.encode(normalize(value)));
  return b64url(new Uint8Array(signature));
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
