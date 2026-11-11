import {
  ensureMemberSubscriptions,
  listSubscribers,
  recordMail,
  type Post,
} from "./db";
import { mailerConfigured, recipient, renderEmail, sendMail, type MailMessage, type MailResult } from "./mail";
import type { Env } from "./http";

async function recordDelivery(
  env: Env,
  input: { kind: string; recipient: string; subject: string },
  delivery: MailResult,
): Promise<void> {
  try {
    await recordMail(env, {
      ...input,
      status: delivery.ok ? "sent" : delivery.reason === "not_configured" ? "skipped" : "failed",
      detail: delivery.ok ? "" : delivery.reason === "failed" ? delivery.error ?? "" : "not configured",
    });
  } catch (error) {
    console.error("could not record email delivery", error);
  }
  if (!delivery.ok && delivery.reason === "failed") {
    console.error("email delivery failed", delivery.error ?? "unknown error");
  }
}

export async function sendLoggedEmail(
  env: Env,
  message: MailMessage,
  input: { kind: string; recipient: string; subject: string },
): Promise<MailResult> {
  let delivery: MailResult;
  try {
    delivery = await sendMail(env, message);
  } catch (error) {
    delivery = { ok: false, reason: "failed", error: error instanceof Error ? error.message : String(error) };
  }
  await recordDelivery(env, input, delivery);
  return delivery;
}

/** Sends one blind-copy batch at a time so subscribers never see each other's addresses. */
export async function announcePublishedPost(env: Env, post: Post): Promise<void> {
  await ensureMemberSubscriptions(env);
  const entries = await listSubscribers(env);
  const emails = [...new Set(
    entries
      .filter((entry) => !entry.unsubscribedAt)
      .map((entry) => entry.email.trim().toLowerCase())
      .filter(Boolean),
  )];
  const subject = `New on Prismelo: ${post.title}`;

  if (emails.length === 0) {
    try {
      await recordMail(env, {
        kind: "new-post",
        status: "skipped",
        recipient: "0 subscribers",
        subject,
        detail: "No active subscribers were found.",
      });
    } catch (error) {
      console.error("could not record empty subscriber notification", error);
    }
    return;
  }

  const content = renderEmail({
    kicker: "New article",
    preheader: post.description,
    heading: post.title,
    details: [
      { label: "Category", value: post.category },
      { label: "Published", value: post.publishedAt.slice(0, 10) },
    ],
    quote: post.description,
    action: { label: "Read the article", href: `https://prismelo.tech/resources/${post.slug}` },
    footer: "You are receiving this because you subscribed to Prismelo updates or created a forum account. Reply to this email if you no longer want article emails.",
  });

  let sent = 0;
  let failed = 0;
  let skipped = false;
  const batchSize = 90;
  for (let offset = 0; offset < emails.length; offset += batchSize) {
    const batch = emails.slice(offset, offset + batchSize);
    let delivery: MailResult;
    try {
      delivery = await sendMail(env, {
        to: recipient(env),
        bcc: batch,
        replyTo: recipient(env),
        subject,
        html: content.html,
        text: content.text,
      });
    } catch (error) {
      delivery = { ok: false, reason: "failed", error: error instanceof Error ? error.message : String(error) };
    }
    if (delivery.ok) sent += batch.length;
    else if (delivery.reason === "not_configured") skipped = true;
    else failed += batch.length;
  }

  const status = sent === 0 && skipped ? "skipped" : failed > 0 && sent === 0 ? "failed" : "sent";
  try {
    await recordMail(env, {
      kind: "new-post",
      status,
      recipient: `${emails.length} subscribers and forum members`,
      subject,
      detail: `Delivered to ${sent}; failed for ${failed}${skipped ? "; email is not configured" : ""}`,
    });
  } catch (error) {
    console.error("could not record new article email", error);
  }
}
