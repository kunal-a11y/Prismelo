/**
 * Cookie-authenticated endpoints are state-changing, so they also check that
 * the request came from this origin. A cross-site form post cannot read the
 * response, but it is cheap to reject it outright.
 */
export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const DEFAULT_MAX_BODY_BYTES = 32 * 1024;

type JsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

/**
 * Reads a JSON body with a hard size cap. Without the cap, a large POST would
 * be parsed into memory before any field validation ran.
 */
export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
  maxBytes = DEFAULT_MAX_BODY_BYTES,
): Promise<JsonResult<T>> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, error: "Request body is too large.", status: 413 };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false, error: "Invalid request body.", status: 400 };
  }

  if (raw.length > maxBytes) {
    return { ok: false, error: "Request body is too large.", status: 413 };
  }

  try {
    return { ok: true, data: JSON.parse(raw) as T };
  } catch {
    return { ok: false, error: "Invalid request body.", status: 400 };
  }
}

/**
 * Only same-site absolute paths are accepted as a post-login destination.
 * `//evil.example` and `/\evil.example` are protocol-relative URLs, not paths.
 */
export function safeNextPath(value: unknown, fallback = "/community") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("\\") || value.includes("://")) return fallback;

  try {
    const url = new URL(value, "https://prismelo.tech");
    if (url.origin !== "https://prismelo.tech") return fallback;
    if (url.pathname.startsWith("/admin")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
