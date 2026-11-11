/**
 * Small HTTP layer: JSON responses, CORS, body caps and origin checks.
 *
 * The API is meant to be called from prismelo.tech. That is a different origin
 * from workers.dev, so every response needs CORS headers, and every mutation
 * needs an explicit origin check — the browser's CORS preflight is not an
 * authorisation mechanism.
 */

export type Ctx = {
  request: Request;
  env: Env;
  url: URL;
  params: Record<string, string>;
};

export type Env = {
  DB: D1Database;
  ALLOWED_ORIGINS?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  EMAIL_FROM?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  BREVO_API_KEY?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  COMMUNITY_SESSION_SECRET?: string;
  COOKIE_DOMAIN?: string;
  /** 32 random bytes (base64url or hex) that encrypt personal data at rest. */
  DATA_KEY?: string;
  /** Server-side pepper mixed into every password hash. */
  PASSWORD_PEPPER?: string;
};

const DEFAULT_ORIGINS = [
  "https://prismelo.tech",
  "https://www.prismelo.tech",
  "http://localhost:3200",
  "http://localhost:3000",
];

export function allowedOrigins(env: Env): string[] {
  const raw = env.ALLOWED_ORIGINS?.trim();
  if (!raw) return DEFAULT_ORIGINS;
  return raw
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function isAllowedOrigin(env: Env, origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins(env).includes(origin.replace(/\/$/, ""));
}

function corsHeaders(env: Env, origin: string | null): Headers {
  const headers = new Headers();
  headers.set("Vary", "Origin");
  if (origin && isAllowedOrigin(env, origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
    headers.set("Access-Control-Max-Age", "600");
  }
  return headers;
}

export function json(
  body: unknown,
  init: { status?: number; env: Env; request?: Request; headers?: Record<string, string> } = {
    env: {} as Env,
  },
): Response {
  const origin = init.request?.headers.get("origin") ?? null;
  const headers = corsHeaders(init.env, origin);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Cross-Origin-Resource-Policy", "same-site");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  for (const [key, value] of Object.entries(init.headers ?? {})) headers.set(key, value);
  return new Response(JSON.stringify(body), { status: init.status ?? 200, headers });
}

export function preflight(ctx: Ctx): Response {
  const origin = ctx.request.headers.get("origin");
  if (!isAllowedOrigin(ctx.env, origin)) {
    return json({ error: "origin_not_allowed" }, { status: 403, env: ctx.env, request: ctx.request });
  }
  return new Response(null, { status: 204, headers: corsHeaders(ctx.env, origin) });
}

/**
 * Mutations must come from a known origin. A browser always sends Origin on a
 * cross-origin POST; a request with no Origin at all is a server-to-server call
 * (curl, a build script) and is allowed through, exactly like the Next routes.
 */
export function originRejected(ctx: Ctx): Response | null {
  const origin = ctx.request.headers.get("origin");
  if (!origin) return null;
  if (isAllowedOrigin(ctx.env, origin)) return null;
  return json({ error: "invalid_origin" }, { status: 403, env: ctx.env, request: ctx.request });
}

export type BodyResult<T> =
  | { ok: true; data: Partial<T> }
  | { ok: false; response: Response };

export async function readJson<T>(ctx: Ctx, maxBytes = 32 * 1024): Promise<BodyResult<T>> {
  const type = ctx.request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    return {
      ok: false,
      response: json({ error: "unsupported_media_type" }, { status: 415, env: ctx.env, request: ctx.request }),
    };
  }

  const declared = Number(ctx.request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return {
      ok: false,
      response: json({ error: "payload_too_large" }, { status: 413, env: ctx.env, request: ctx.request }),
    };
  }

  let raw: string;
  try {
    raw = await ctx.request.text();
  } catch {
    return {
      ok: false,
      response: json({ error: "invalid_json" }, { status: 400, env: ctx.env, request: ctx.request }),
    };
  }

  if (raw.length > maxBytes) {
    return {
      ok: false,
      response: json({ error: "payload_too_large" }, { status: 413, env: ctx.env, request: ctx.request }),
    };
  }

  try {
    const data = JSON.parse(raw) as Partial<T>;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("not an object");
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: json({ error: "invalid_json" }, { status: 400, env: ctx.env, request: ctx.request }),
    };
  }
}

/** A coarse per-IP key: Cloudflare always sets CF-Connecting-IP. */
export function clientKey(ctx: Ctx): string {
  return (
    ctx.request.headers.get("cf-connecting-ip") ??
    ctx.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export const MAX = {
  name: 80,
  email: 254,
  company: 120,
  service: 80,
  details: 4000,
  title: 140,
  body: 8000,
  password: 200,
  bio: 400,
};

export function cleanEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 5 || email.length > MAX.email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}

export function cleanText(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text.length < min || text.length > max) return null;
  return text;
}
