import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * Single delivery path for every outgoing message: the contact form and the
 * community notifications both go out over SMTP (Brevo relay by default).
 *
 * Nothing here throws into a request handler. Callers decide whether an
 * unconfigured or failed send should surface as an error, and nothing is ever
 * reported as "sent" unless the relay accepted it.
 */

export type MailDelivery =
  | { ok: true; id: string }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "failed"; error: string };

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
};

function smtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = Number(process.env.SMTP_PORT ?? 587);

  if (!host || !user || !pass) return null;
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;

  return { host, port, user, pass };
}

/** Verified sender at the relay. Falls back to the SMTP login when unset. */
export function senderAddress() {
  const explicit =
    process.env.CONTACT_FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim();
  return explicit || smtpConfig()?.user || "";
}

export function mailerConfigured() {
  return smtpConfig() !== null && Boolean(senderAddress());
}

let cached: Transporter | null = null;
let cachedKey = "";

function transporter(): Transporter | null {
  const config = smtpConfig();
  if (!config) return null;

  // Rebuild if the credentials changed (hot reload with new env values).
  const key = `${config.host}:${config.port}:${config.user}:${config.pass.length}`;
  if (cached && cachedKey === key) return cached;

  cached = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    // 465 is implicit TLS; 587 and 2525 upgrade with STARTTLS.
    secure: config.port === 465,
    requireTLS: config.port !== 465,
    auth: { user: config.user, pass: config.pass },
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  cachedKey = key;
  return cached;
}

function describe(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/\s+/g, " ").slice(0, 300);
}

export type InlineAttachment = {
  filename: string;
  path: string;
  cid: string;
  contentDisposition: "inline";
};

export async function deliverMail({
  to,
  subject,
  text,
  html,
  replyTo,
  attachments,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: InlineAttachment[];
}): Promise<MailDelivery> {
  const transport = transporter();
  const from = senderAddress();

  if (!transport || !from) return { ok: false, reason: "not_configured" };

  try {
    const info = await transport.sendMail({
      from,
      to,
      replyTo: replyTo || undefined,
      subject,
      text,
      html,
      attachments: attachments?.length ? attachments : undefined,
    });
    return { ok: true, id: info.messageId };
  } catch (error) {
    return { ok: false, reason: "failed", error: describe(error) };
  }
}
