import {
  MAX,
  cleanEmail,
  cleanText,
  clientKey,
  json,
  originRejected,
  readJson,
  type Ctx,
} from "../http";
import { getPost, hitRateLimit, listPosts, readingTime, recordMail, addSubscriber, unsubscribeByToken } from "../db";
import { encryptionConfigured } from "../crypto";
import { mailerConfigured, recipient, renderEmail, sendMail } from "../mail";

/* -------------------------------------------------------------------- health */

export async function health(ctx: Ctx): Promise<Response> {
  let storage = "ok";
  try {
    await ctx.env.DB.prepare("SELECT 1 AS ok").first();
  } catch {
    storage = "unavailable";
  }

  return json(
    {
      ok: storage === "ok",
      service: "prismelo-api",
      storage,
      mail: mailerConfigured(ctx.env) ? "configured" : "missing",
      admin: Boolean(ctx.env.ADMIN_PASSWORD) ? "configured" : "missing",
      // Personal data is only really protected when both of these are set;
      // reporting them makes a half-configured deployment visible.
      encryption: encryptionConfigured(ctx.env) ? "configured" : "missing",
      passwordPepper: ctx.env.PASSWORD_PEPPER ? "configured" : "missing",
    },
    { status: storage === "ok" ? 200 : 503, env: ctx.env, request: ctx.request },
  );
}

/* ------------------------------------------------------------------- contact */

type ContactPayload = {
  name: string;
  email: string;
  company: string;
  service: string;
  details: string;
  website: string;
};

const CONTACT_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_MAX = 5;

export async function contact(ctx: Ctx): Promise<Response> {
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const parsed = await readJson<ContactPayload>(ctx);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  // Honeypot: a bot fills every field it can see; a person never sees this one.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return json({ ok: true }, { env: ctx.env, request: ctx.request });
  }

  const fields: Record<string, string> = {};
  const name = cleanText(body.name, 2, MAX.name);
  const email = cleanEmail(body.email);
  const details = cleanText(body.details, 20, MAX.details);
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const service = typeof body.service === "string" ? body.service.trim() : "";

  if (!name) fields.name = "Name must be between 2 and 80 characters.";
  if (!email) fields.email = "A valid email address is required.";
  if (!details) fields.details = "Details must be between 20 and 4000 characters.";
  if (company.length > MAX.company) fields.company = "Company must be under 120 characters.";
  if (service.length > MAX.service) fields.service = "Unknown service.";

  if (Object.keys(fields).length > 0) {
    return json({ error: "validation_failed", fields }, { status: 400, env: ctx.env, request: ctx.request });
  }

  const hits = await hitRateLimit(ctx.env, `contact:${clientKey(ctx)}`, CONTACT_WINDOW_MS);
  if (hits > CONTACT_MAX) {
    return json({ error: "rate_limited" }, { status: 429, env: ctx.env, request: ctx.request });
  }

  if (!mailerConfigured(ctx.env)) {
    return json({ error: "delivery_not_configured" }, { status: 501, env: ctx.env, request: ctx.request });
  }

  const firstName = name!.split(/\s+/)[0];
  const subject = `Website enquiry - ${service || "General"}`;
  const content = renderEmail({
    kicker: "New website enquiry",
    preheader: details!.slice(0, 110),
    heading: `New enquiry from ${name}`,
    details: [
      { label: "Name", value: name! },
      { label: "Email", value: email! },
      { label: "Company", value: company || "Not provided" },
      { label: "Service", value: service || "Not sure yet" },
    ],
    quote: details!,
    action: {
      label: `Reply to ${firstName}`,
      href: `mailto:${encodeURIComponent(email!)}?subject=${encodeURIComponent(
        `Re: your enquiry to Prismelo Technology`,
      )}`,
    },
    footer: [
      `Replying to this email goes straight to ${name} at ${email}.`,
      "Submitted through the contact form on prismelo.tech.",
    ].join("\n"),
  });

  const delivery = await sendMail(ctx.env, {
    to: recipient(ctx.env),
    replyTo: email!,
    subject,
    html: content.html,
    text: content.text,
  });

  if (!delivery.ok) {
    const detail = delivery.reason === "failed" ? delivery.error ?? "" : "not configured";
    await recordMail(ctx.env, { kind: "contact", status: "failed", recipient: recipient(ctx.env), subject, detail });
    console.error("contact delivery failed", detail);
    return json({ error: "delivery_failed" }, { status: 502, env: ctx.env, request: ctx.request });
  }

  await recordMail(ctx.env, { kind: "contact", status: "sent", recipient: recipient(ctx.env), subject });
  return json({ ok: true }, { env: ctx.env, request: ctx.request });
}

/* ----------------------------------------------------------------- subscribe */

type SubscribePayload = { email: string; source: "resources" | "community" };

export async function subscribe(ctx: Ctx): Promise<Response> {
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const parsed = await readJson<SubscribePayload>(ctx, 4 * 1024);
  if (!parsed.ok) return parsed.response;

  const email = cleanEmail(parsed.data.email);
  if (!email) {
    return json(
      { error: "Enter a valid email address." },
      { status: 400, env: ctx.env, request: ctx.request },
    );
  }

  const hits = await hitRateLimit(ctx.env, `subscribe:${clientKey(ctx)}`, 60 * 60 * 1000);
  if (hits > 10) {
    return json({ error: "rate_limited" }, { status: 429, env: ctx.env, request: ctx.request });
  }

  const source = parsed.data.source === "community" ? "community" : "resources";
  const { subscriber, created } = await addSubscriber(ctx.env, email, source);

  // A confirmation mail is a nicety, never a condition: the address is already
  // stored, so a relay outage must not turn a successful signup into an error.
  if (created) {
    const content = renderEmail({
      kicker: "Subscription confirmed",
      heading: "You are on the list",
      details: [{ label: "Email", value: email }],
      quote:
        "We send a short note when a new engineering article goes up. No newsletter drip, no sales sequence.",
      action: { label: "Unsubscribe at any time", href: `https://prismelo.tech/unsubscribe?token=${subscriber.token}` },
      footer: "You received this because you subscribed on prismelo.tech.",
    });

    const delivery = await sendMail(ctx.env, {
      to: email,
      subject: "You are subscribed to Prismelo Technology",
      html: content.html,
      text: content.text,
    });

    await recordMail(ctx.env, {
      kind: "subscribe",
      status: delivery.ok ? "sent" : delivery.reason === "not_configured" ? "skipped" : "failed",
      recipient: email,
      subject: "You are subscribed",
      detail: delivery.ok ? "" : delivery.reason === "failed" ? delivery.error ?? "" : "not configured",
    });
  }

  return json({ ok: true }, { env: ctx.env, request: ctx.request });
}

export async function unsubscribe(ctx: Ctx): Promise<Response> {
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const parsed = await readJson<{ token: string }>(ctx, 2 * 1024);
  if (!parsed.ok) return parsed.response;

  const token = typeof parsed.data.token === "string" ? parsed.data.token.trim() : "";
  if (!/^[a-f0-9]{16,64}$/.test(token)) {
    return json({ error: "invalid_token" }, { status: 400, env: ctx.env, request: ctx.request });
  }

  const removed = await unsubscribeByToken(ctx.env, token);
  if (!removed) {
    return json({ error: "invalid_token" }, { status: 400, env: ctx.env, request: ctx.request });
  }

  return json({ ok: true }, { env: ctx.env, request: ctx.request });
}

/* ----------------------------------------------------------------- resources */

export async function resources(ctx: Ctx): Promise<Response> {
  const posts = await listPosts(ctx.env);
  return json(
    { resources: posts },
    { env: ctx.env, request: ctx.request, headers: { "Cache-Control": "public, max-age=60" } },
  );
}

export async function resource(ctx: Ctx): Promise<Response> {
  const post = await getPost(ctx.env, ctx.params.slug);
  if (!post || post.draft) {
    return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });
  }

  return json(
    {
      post: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        date: post.publishedAt.slice(0, 10),
        featured: post.featured,
        readingTime: readingTime(post.body),
        body: post.body,
      },
    },
    { env: ctx.env, request: ctx.request, headers: { "Cache-Control": "public, max-age=60" } },
  );
}
