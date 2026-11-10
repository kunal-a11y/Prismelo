import { MAX, cleanText, clientKey, json, originRejected, readJson, type Ctx } from "../http";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  adminConfigured,
  clearCookie,
  createAdminToken,
  requestToken,
  sessionCookie,
  slugify,
  verifyAdminToken,
} from "../auth";
import {
  deletePost,
  deleteReply,
  deleteSubscriber,
  deleteThread,
  findThreadById,
  getPost,
  hitRateLimit,
  listPosts,
  listSubscribers,
  listThreads,
  nowIso,
  recentMail,
  recordMail,
  updateThread,
  upsertPost,
} from "../db";
import { mailerConfigured, renderEmail, sendMail } from "../mail";

async function isAdmin(ctx: Ctx): Promise<boolean> {
  const token = requestToken(ctx.request, ADMIN_COOKIE);
  return verifyAdminToken(ctx.env, token);
}

async function unauthorised(ctx: Ctx): Promise<Response> {
  return json({ error: "Not signed in." }, { status: 401, env: ctx.env, request: ctx.request });
}

/* --------------------------------------------------------------------- login */

export async function login(ctx: Ctx): Promise<Response> {
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  if (!adminConfigured(ctx.env)) {
    return json({ error: "Admin access is not configured." }, { status: 503, env: ctx.env, request: ctx.request });
  }

  const hits = await hitRateLimit(ctx.env, `admin-login:${clientKey(ctx)}`, 15 * 60 * 1000);
  if (hits > 10) {
    return json({ error: "Too many attempts." }, { status: 429, env: ctx.env, request: ctx.request });
  }

  const parsed = await readJson<{ password: string }>(ctx);
  if (!parsed.ok) return parsed.response;

  const given = typeof parsed.data.password === "string" ? parsed.data.password : "";
  const expected = ctx.env.ADMIN_PASSWORD ?? "";

  // Compare digests, not the raw strings, so the comparison is the same length
  // whatever the password is and the answer never depends on where it differs.
  const digest = async (value: string) =>
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  const [a, b] = await Promise.all([digest(given), digest(expected)]);
  let diff = a.length ^ b.length;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];

  if (diff !== 0) {
    return json({ error: "Incorrect password." }, { status: 401, env: ctx.env, request: ctx.request });
  }

  const token = await createAdminToken(ctx.env);
  return json(
    { ok: true, token },
    {
      env: ctx.env,
      request: ctx.request,
      headers: { "Set-Cookie": sessionCookie(ctx.env, ADMIN_COOKIE, token, ADMIN_MAX_AGE) },
    },
  );
}

export async function logout(ctx: Ctx): Promise<Response> {
  return json(
    { ok: true },
    { env: ctx.env, request: ctx.request, headers: { "Set-Cookie": clearCookie(ctx.env, ADMIN_COOKIE) } },
  );
}

/* ----------------------------------------------------------------- resources */

export async function resources(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  return json({ posts: await listPosts(ctx.env, true) }, { env: ctx.env, request: ctx.request });
}

type PostPayload = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  featured: boolean;
  draft: boolean;
  body: string;
};

function validatePost(body: Partial<PostPayload>) {
  const fields: Record<string, string> = {};
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const title = cleanText(body.title, 4, 140);
  const description = cleanText(body.description, 10, 400);
  const category = cleanText(body.category, 2, 40) ?? "Engineering";
  const text = cleanText(body.body, 40, 200_000);

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    fields.slug = "Use lowercase words separated by hyphens.";
  }
  if (!title) fields.title = "Add a title between 4 and 140 characters.";
  if (!description) fields.description = "Add a summary between 10 and 400 characters.";
  if (!text) fields.body = "The post body needs at least 40 characters.";
  if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(body.date))) {
    fields.date = "Use a date like 2026-11-10.";
  }

  return { fields, slug, title, description, category, text };
}

export async function createResource(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const parsed = await readJson<PostPayload>(ctx, 256 * 1024);
  if (!parsed.ok) return parsed.response;

  const { fields, slug, title, description, category, text } = validatePost(parsed.data);
  if (Object.keys(fields).length > 0) {
    return json({ error: "Check the highlighted fields.", fields }, { status: 400, env: ctx.env, request: ctx.request });
  }

  if (await getPost(ctx.env, slug)) {
    return json({ error: "That slug is already used." }, { status: 409, env: ctx.env, request: ctx.request });
  }

  const post = {
    slug,
    title: title!,
    description: description!,
    category: category!,
    publishedAt: String(parsed.data.date ?? nowIso().slice(0, 10)),
    featured: Boolean(parsed.data.featured),
    draft: Boolean(parsed.data.draft),
    body: text!,
    updatedAt: nowIso(),
  };

  await upsertPost(ctx.env, post);
  return json({ ok: true, post }, { env: ctx.env, request: ctx.request });
}

export async function updateResource(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const existing = await getPost(ctx.env, ctx.params.slug);
  if (!existing) {
    return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });
  }

  const parsed = await readJson<PostPayload>(ctx, 256 * 1024);
  if (!parsed.ok) return parsed.response;

  // A PATCH may carry only what changed — publishing from the admin list sends
  // `{ draft: false }` and nothing else — so untouched fields fall back to the
  // stored post before validation runs.
  const { fields, title, description, category, text } = validatePost({
    slug: existing.slug,
    title: parsed.data.title ?? existing.title,
    description: parsed.data.description ?? existing.description,
    category: parsed.data.category ?? existing.category,
    date: parsed.data.date ?? existing.publishedAt,
    body: parsed.data.body ?? existing.body,
  });
  if (Object.keys(fields).length > 0) {
    return json({ error: "Check the highlighted fields.", fields }, { status: 400, env: ctx.env, request: ctx.request });
  }

  const post = {
    ...existing,
    title: title!,
    description: description!,
    category: category!,
    publishedAt: String(parsed.data.date ?? existing.publishedAt).slice(0, 10),
    featured: typeof parsed.data.featured === "boolean" ? parsed.data.featured : existing.featured,
    draft: typeof parsed.data.draft === "boolean" ? parsed.data.draft : existing.draft,
    body: text!,
    updatedAt: nowIso(),
  };

  await upsertPost(ctx.env, post);
  return json({ ok: true, post }, { env: ctx.env, request: ctx.request });
}

export async function deleteResource(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  const removed = await deletePost(ctx.env, ctx.params.slug);
  if (!removed) return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });
  return json({ ok: true }, { env: ctx.env, request: ctx.request });
}

/* ----------------------------------------------------------------- community */

export async function communityThreads(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  return json({ threads: await listThreads(ctx.env) }, { env: ctx.env, request: ctx.request });
}

export async function moderateThread(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const thread = await findThreadById(ctx.env, ctx.params.id);
  if (!thread) return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });

  const parsed = await readJson<{ locked?: boolean; pinned?: boolean }>(ctx, 2 * 1024);
  if (!parsed.ok) return parsed.response;

  await updateThread(ctx.env, thread.id, {
    locked: typeof parsed.data.locked === "boolean" ? parsed.data.locked : undefined,
    pinned: typeof parsed.data.pinned === "boolean" ? parsed.data.pinned : undefined,
  });

  return json({ ok: true }, { env: ctx.env, request: ctx.request });
}

export async function removeThread(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  const thread = await findThreadById(ctx.env, ctx.params.id);
  if (!thread) return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });
  await deleteThread(ctx.env, thread.id);
  return json({ ok: true }, { env: ctx.env, request: ctx.request });
}

export async function removeReply(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  const removed = await deleteReply(ctx.env, ctx.params.id);
  if (!removed) return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });
  return json({ ok: true }, { env: ctx.env, request: ctx.request });
}

export async function subscribers(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  return json({ subscribers: await listSubscribers(ctx.env) }, { env: ctx.env, request: ctx.request });
}

export async function removeSubscriber(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  const removed = await deleteSubscriber(ctx.env, ctx.params.id);
  if (!removed) return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });
  return json({ ok: true }, { env: ctx.env, request: ctx.request });
}

export async function mailLog(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  return json({ mail: await recentMail(ctx.env) }, { env: ctx.env, request: ctx.request });
}

/* -------------------------------------------------------------- legal notice */

export async function notifyLegal(ctx: Ctx): Promise<Response> {
  if (!(await isAdmin(ctx))) return unauthorised(ctx);
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  if (!mailerConfigured(ctx.env)) {
    return json({ error: "delivery_not_configured" }, { status: 501, env: ctx.env, request: ctx.request });
  }

  const parsed = await readJson<{ subject: string; message: string }>(ctx, 32 * 1024);
  if (!parsed.ok) return parsed.response;

  const subject = cleanText(parsed.data.subject, 4, MAX.title);
  const message = cleanText(parsed.data.message, 20, MAX.details);
  if (!subject || !message) {
    return json(
      { error: "Check the highlighted fields.", fields: { subject: "Add a subject.", message: "Add the notice text." } },
      { status: 400, env: ctx.env, request: ctx.request },
    );
  }

  const active = (await listSubscribers(ctx.env)).filter((entry) => !entry.unsubscribedAt);
  const content = renderEmail({
    kicker: "Policy update",
    heading: subject!,
    quote: message!,
    action: { label: "Read the policy", href: "https://prismelo.tech/legal/privacy" },
    footer: "You are receiving this because you subscribed to Prismelo Technology updates.",
  });

  let sent = 0;
  let failed = 0;

  // One message per recipient: a shared To: header would disclose every address.
  for (const entry of active) {
    const delivery = await sendMail(ctx.env, {
      to: entry.email,
      subject: subject!,
      html: content.html,
      text: content.text,
    });
    if (delivery.ok) sent += 1;
    else failed += 1;
  }

  await recordMail(ctx.env, {
    kind: "legal",
    status: failed === 0 ? "sent" : sent > 0 ? "sent" : "failed",
    recipient: `${sent + failed} subscribers`,
    subject: subject!,
    detail: `${sent} sent, ${failed} failed`,
  });

  return json({ ok: true, sent, failed }, { env: ctx.env, request: ctx.request });
}

/** Used by the admin UI to render a "next slug" hint. */
export function suggestSlug(title: string): string {
  return slugify(title, "post");
}
