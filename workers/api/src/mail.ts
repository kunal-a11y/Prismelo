/**
 * Email from a Worker.
 *
 * `nodemailer` cannot run here: it imports Node's `net`, which Workers do not
 * provide. What Workers *do* provide is `connect()` from `cloudflare:sockets`,
 * and SMTP is a line-based conversation over a TCP socket — so this file speaks
 * it directly. Port 465 uses implicit TLS; port 587 opens in the clear and is
 * upgraded with STARTTLS before the password is sent.
 *
 * Port 25 is blocked by Cloudflare, by design.
 */

import { connect } from "cloudflare:sockets";
import type { Env } from "./http";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type MailResult =
  | { ok: true; accepted: string[] }
  | { ok: false; reason: "not_configured" | "failed"; error?: string };

function smtpConfig(env: Env) {
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS?.trim();
  const port = Number(env.SMTP_PORT?.trim() || "465");
  if (!host || !user || !pass) return null;
  return { host, port: Number.isFinite(port) ? port : 465, user, pass };
}

export function mailerConfigured(env: Env): boolean {
  return Boolean(env.BREVO_API_KEY?.trim()) || smtpConfig(env) !== null;
}

/** Sender for outbound mail: "Prismelo <hello@prismelo.tech>" or a bare address. */
export function sender(env: Env): { name: string; email: string } {
  const raw = (env.CONTACT_FROM_EMAIL || env.EMAIL_FROM || "Prismelo <hello@prismelo.tech>").trim();
  const match = /^(.*)<([^>]+)>$/.exec(raw);
  if (match) return { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() };
  return { name: "Prismelo", email: raw };
}

export function recipient(env: Env): string {
  return (env.CONTACT_TO_EMAIL || "hello@prismelo.tech").trim();
}

/* ------------------------------------------------------------------- SMTP I/O */

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(label)), ms)),
  ]);
}

const encoder = new TextEncoder();

class SmtpConnection {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private decoder = new TextDecoder();
  private buffer = "";
  private closed = false;

  constructor(private socket: Socket) {
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
  }

  private attach(socket: Socket) {
    this.socket = socket;
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
    this.decoder = new TextDecoder();
    this.buffer = "";
    this.closed = false;
  }

  private async fill(): Promise<void> {
    const { value, done } = await withTimeout(this.reader.read(), 20_000, "smtp read timeout");
    if (done) {
      this.closed = true;
      return;
    }
    if (value) this.buffer += this.decoder.decode(value, { stream: true });
  }

  private async readLine(): Promise<string> {
    for (;;) {
      const index = this.buffer.indexOf("\n");
      if (index >= 0) {
        const line = this.buffer.slice(0, index).replace(/\r$/, "");
        this.buffer = this.buffer.slice(index + 1);
        return line;
      }
      if (this.closed) throw new Error("smtp connection closed");
      await this.fill();
    }
  }

  /** Reads a full SMTP reply, joining `250-` continuation lines. */
  async reply(): Promise<{ code: number; text: string }> {
    const lines: string[] = [];
    let code = 0;
    for (;;) {
      const line = await this.readLine();
      lines.push(line);
      const match = /^(\d{3})([ -])(.*)$/.exec(line);
      if (!match) continue;
      code = Number(match[1]);
      if (match[2] === " ") break;
    }
    return { code, text: lines.join(" | ") };
  }

  async write(data: string): Promise<void> {
    await withTimeout(this.writer.write(encoder.encode(data)), 20_000, "smtp write timeout");
  }

  async command(line: string): Promise<{ code: number; text: string }> {
    await this.write(`${line}\r\n`);
    return this.reply();
  }

  async expect(line: string, allowed: number[]): Promise<{ code: number; text: string }> {
    const response = await this.command(line);
    if (!allowed.includes(response.code)) {
      throw new Error(`${line.split(" ")[0]} rejected: ${response.code} ${response.text.slice(0, 200)}`);
    }
    return response;
  }

  startTls(): void {
    this.attach(this.socket.startTls());
  }

  async close(): Promise<void> {
    try {
      await withTimeout(this.write("QUIT\r\n"), 3_000, "quit timeout");
      await withTimeout(this.reader.cancel(), 2_000, "cancel timeout");
    } catch {
      /* already gone */
    }
  }
}

/* -------------------------------------------------------------------- message */

function stripNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function base64(value: string): string {
  const bytes = encoder.encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = btoa(binary);
  return encoded.replace(/(.{76})/g, "$1\r\n");
}

function encodeHeader(value: string): string {
  const clean = stripNewlines(value);
  // eslint-disable-next-line no-control-regex
  return /^[\x20-\x7E]*$/.test(clean) ? clean : `=?UTF-8?B?${base64(clean).replace(/\r\n/g, "")}?=`;
}

function addresses(value: string): { name: string; email: string }[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = /^(.*)<([^>]+)>$/.exec(part);
      if (match) return { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() };
      return { name: "", email: part };
    });
}

/**
 * A full RFC 5322 message. Both parts are base64 encoded, so a subject line
 * with an em dash and a message with a `Subject:` line in the body cannot break
 * the message structure.
 */
function buildMessage(from: { name: string; email: string }, message: MailMessage): string {
  const boundary = `prismelo_${crypto.getRandomValues(new Uint32Array(2)).join("_")}`;
  const domain = from.email.split("@")[1] || "prismelo.tech";
  const messageId = `<${crypto.getRandomValues(new Uint32Array(3)).join(".")}@${domain}>`;
  const head = [
    `From: ${from.name ? `${from.name} ` : ""}<${from.email}>`,
    `To: ${addresses(message.to)
      .map((entry) => (entry.name ? `${entry.name} <${entry.email}>` : `<${entry.email}>`))
      .join(", ")}`,
  ];

  if (message.replyTo) head.push(`Reply-To: <${stripNewlines(message.replyTo)}>`);
  head.push(
    `Subject: ${encodeHeader(message.subject)}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  );

  const body = [
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64(message.text),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64(message.html),
    `--${boundary}--`,
    "",
  ];

  return `${head.join("\r\n")}\r\n${body.join("\r\n")}`;
}

/** SMTP DATA terminates on a lone dot, so any line starting with one is doubled. */
function dotStuff(message: string): string {
  return message
    .split("\r\n")
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
}

export async function sendMail(env: Env, message: MailMessage): Promise<MailResult> {
  const apiKey = env.BREVO_API_KEY?.trim();
  if (apiKey) {
    const from = sender(env);
    const recipients = addresses(message.to);
    if (recipients.length === 0) return { ok: false, reason: "failed", error: "no recipients" };
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: from,
          to: recipients,
          subject: message.subject,
          htmlContent: message.html,
          textContent: message.text,
          ...(message.replyTo ? { replyTo: { email: message.replyTo } } : {}),
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        const detail = (await response.text()).slice(0, 300);
        return { ok: false, reason: "failed", error: `Brevo API ${response.status}: ${detail}` };
      }
      return { ok: true, accepted: recipients.map((entry) => entry.email) };
    } catch (error) {
      return { ok: false, reason: "failed", error: error instanceof Error ? error.message : "Brevo API request failed" };
    }
  }

  const config = smtpConfig(env);
  if (!config) return { ok: false, reason: "not_configured" };

  const from = sender(env);
  const to = addresses(message.to);
  if (to.length === 0) return { ok: false, reason: "failed", error: "no recipients" };

  const secure = config.port === 465;
  let socket: Socket | undefined;

  try {
    socket = connect(
      { hostname: config.host, port: config.port },
      { secureTransport: secure ? "on" : "off", allowHalfOpen: false },
    );
    const smtp = new SmtpConnection(socket);

    const greeting = await smtp.reply();
    if (greeting.code !== 220) throw new Error(`greeting: ${greeting.code} ${greeting.text.slice(0, 120)}`);

    const hostname = from.email.split("@")[1] || "prismelo.tech";
    await smtp.expect(`EHLO ${hostname}`, [250]);

    if (!secure) {
      await smtp.expect("STARTTLS", [220]);
      smtp.startTls();
      await smtp.expect(`EHLO ${hostname}`, [250]);
    }

    const credentials = btoa(`\0${config.user}\0${config.pass}`);
    const auth = await smtp.command(`AUTH PLAIN ${credentials}`);
    if (auth.code !== 235) {
      // Some relays answer AUTH PLAIN with a 334 challenge before accepting.
      if (auth.code === 334) {
        await smtp.expect(credentials, [235]);
      } else {
        throw new Error(`auth: ${auth.code} ${auth.text.slice(0, 160)}`);
      }
    }

    await smtp.expect(`MAIL FROM:<${from.email}>`, [250]);
    for (const entry of to) await smtp.expect(`RCPT TO:<${entry.email}>`, [250, 251]);

    await smtp.expect("DATA", [354]);
    await smtp.write(`${dotStuff(buildMessage(from, message))}\r\n.\r\n`);
    const accepted = await smtp.reply();
    if (accepted.code !== 250) throw new Error(`data: ${accepted.code} ${accepted.text.slice(0, 160)}`);

    await smtp.close();
    return { ok: true, accepted: to.map((entry) => entry.email) };
  } catch (error) {
    try {
      socket?.close();
    } catch {
      /* already closed */
    }
    return { ok: false, reason: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}

/* -------------------------------------------------------------------- template */

export type EmailContent = {
  kicker: string;
  heading: string;
  preheader?: string;
  details?: Array<{ label: string; value: string }>;
  quote?: string;
  action?: { label: string; href: string };
  footer?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

/** The same dark, prism-branded layout the Next app sends. */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const rows = (content.details ?? [])
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #23262b;color:#8b909a;font-size:12px;letter-spacing:.08em;text-transform:uppercase;width:34%;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #23262b;color:#f4f6fb;font-size:15px;vertical-align:top;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("");

  const details = rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;">${rows}</table>` : "";

  const quote = content.quote
    ? `<div style="margin:26px 0 0;padding:20px 22px;background:#14171c;border-left:2px solid #f4f6fb;border-radius:4px;color:#dfe3ea;font-size:15px;line-height:1.65;">${escapeMultiline(content.quote)}</div>`
    : "";

  const action = content.action
    ? `<div style="margin:28px 0 4px;"><a href="${escapeHtml(content.action.href)}" style="display:inline-block;background:#f4f6fb;color:#0b0d10;text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:999px;">${escapeHtml(content.action.label)}</a></div>`
    : "";

  const footer = content.footer
    ? `<p style="margin:0;color:#8b909a;font-size:12px;line-height:1.7;">${escapeMultiline(content.footer)}</p>`
    : "";

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(content.heading)}</title></head>
<body style="margin:0;padding:0;background:#0b0d10;">
${content.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0d10;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0f1216;border:1px solid #23262b;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<tr><td style="padding:22px 28px;border-bottom:1px solid #23262b;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:11px;"><img src="https://prismelo.tech/email-logo.png" width="28" height="28" alt="" style="display:block;border-radius:6px;" /></td>
<td style="color:#f4f6fb;font-size:15px;font-weight:600;letter-spacing:.01em;">Prismelo Technology</td>
</tr></table>
</td></tr>
<tr><td style="padding:30px 28px 34px;">
<p style="margin:0 0 12px;color:#8b909a;font-size:11px;letter-spacing:.14em;text-transform:uppercase;">${escapeHtml(content.kicker)}</p>
<h1 style="margin:0;color:#f4f6fb;font-size:23px;line-height:1.35;font-weight:600;">${escapeHtml(content.heading)}</h1>
${details}${quote}${action}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #23262b;background:#0c0f13;">
${footer}
<p style="margin:8px 0 0;color:#6b7280;font-size:12px;">prismelo.tech &middot; hello@prismelo.tech</p>
</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    content.kicker.toUpperCase(),
    "",
    content.heading,
    "",
    ...(content.details ?? []).map((row) => `${row.label}: ${row.value}`),
    content.quote ? `\n${content.quote}` : "",
    content.action ? `\n${content.action.label}: ${content.action.href}` : "",
    content.footer ? `\n${content.footer}` : "",
    "\nprismelo.tech - hello@prismelo.tech",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { html, text };
}
