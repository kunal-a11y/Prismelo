import { NextResponse } from "next/server";
import { deliverBranded } from "@/lib/email";
import { mailerConfigured } from "@/lib/mailer";
import { site } from "@/lib/site";
import { readJsonBody } from "@/lib/request";

export const runtime = "nodejs";

type Payload = {
  name: string;
  email: string;
  company: string;
  service: string;
  details: string;
  website: string;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter(
    (time) => now - time < WINDOW_MS,
  );
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > MAX_PER_WINDOW;
}

function validate(body: Partial<Payload>) {
  const errors: Record<string, string> = {};

  if (!body.name || body.name.trim().length < 2 || body.name.trim().length > 80) {
    errors.name = "Name must be between 2 and 80 characters.";
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email.trim())) {
    errors.email = "A valid email address is required.";
  }
  if (body.company && body.company.trim().length > 120) {
    errors.company = "Company must be under 120 characters.";
  }
  if (
    !body.details ||
    body.details.trim().length < 20 ||
    body.details.trim().length > 4000
  ) {
    errors.details = "Details must be between 20 and 4000 characters.";
  }
  if (body.service && body.service.length > 80) {
    errors.service = "Unknown service.";
  }

  return errors;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "unsupported_media_type" }, { status: 415 });
  }

  const parsed = await readJsonBody<Partial<Payload>>(request);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.status === 413 ? "payload_too_large" : "invalid_json" },
      { status: parsed.status },
    );
  }
  const body = parsed.data;

  // Honeypot: accept silently so bots do not learn the check exists.
  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const errors = validate(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "validation_failed", fields: errors },
      { status: 400 },
    );
  }

  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const payload: Payload = {
    name: body.name!.trim(),
    email: body.email!.trim(),
    company: (body.company ?? "").trim(),
    service: (body.service ?? "").trim(),
    details: body.details!.trim(),
    website: "",
  };

  const to = process.env.CONTACT_TO_EMAIL?.trim() || site.contactEmail;

  if (!mailerConfigured()) {
    // No delivery provider is configured. Report this honestly rather than
    // pretending the message was delivered. See /docs/guides/contact-form-integration.
    return NextResponse.json(
      { error: "delivery_not_configured" },
      { status: 501 },
    );
  }

  const firstName = payload.name.split(/\s+/)[0];
  const replyHref = `mailto:${encodeURIComponent(payload.email)}?subject=${encodeURIComponent(
    `Re: your enquiry to ${site.legalName}`,
  )}`;

  const delivery = await deliverBranded({
    to,
    replyTo: payload.email,
    subject: `Website enquiry — ${payload.service || "General"}`,
    content: {
      kicker: "New website enquiry",
      preheader: payload.details.slice(0, 110),
      heading: `New enquiry from ${payload.name}`,
      details: [
        { label: "Name", value: payload.name },
        { label: "Email", value: payload.email },
        { label: "Company", value: payload.company || "Not provided" },
        { label: "Service", value: payload.service || "Not sure yet" },
      ],
      quote: payload.details,
      action: { label: `Reply to ${firstName}`, href: replyHref },
      footer: [
        `Replying to this email goes straight to ${payload.name} at ${payload.email}.`,
        `Submitted through the contact form on ${site.url.replace(/^https?:\/\//, "")}.`,
      ].join("\n"),
    },
  });

  if (!delivery.ok) {
    console.error(
      "contact delivery failed",
      delivery.reason === "failed" ? delivery.error : delivery.reason,
    );
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
