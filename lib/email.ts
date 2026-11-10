import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, newId } from "@/lib/community-store";
import {
  deliverMail,
  mailerConfigured,
  type InlineAttachment,
} from "@/lib/mailer";
import { site } from "@/lib/site";

/**
 * Notification email, sent over the same SMTP relay the contact form uses.
 * Nothing here throws into a request handler: a failed send is recorded in
 * data/email-log.json and the forum action still succeeds.
 *
 * With no relay configured the send is recorded as "skipped" instead of
 * pretending it went out, and /admin/community says so plainly.
 */

const LOG_FILE = path.join(DATA_DIR, "email-log.json");
const LOG_LIMIT = 200;

/** Email clients cannot render SVG, so the header mark is a raster copy of
 *  app/icon.svg. It is sent as an inline CID attachment so the header also
 *  works before the file is live at the public URL — and in clients that block
 *  remote images by default. */
const LOGO_FILE = path.join(process.cwd(), "public", "email-logo.png");
const LOGO_CID = "prismelo-logo";
const LOGO_URL = `${site.url}/email-logo.png`;
const SITE_HOST = site.url.replace(/^https?:\/\//, "");

export type MailKind =
  | "new-post"
  | "forum-welcome"
  | "forum-created"
  | "forum-reply"
  | "subscribe"
  | "legal-update";

export type MailStatus = "sent" | "failed" | "skipped";

export type MailLogEntry = {
  id: string;
  at: string;
  to: string;
  subject: string;
  kind: MailKind;
  status: MailStatus;
  error?: string;
};

export function emailConfigured() {
  return mailerConfigured();
}

function logoAttachment(): InlineAttachment | null {
  try {
    if (!fs.existsSync(LOGO_FILE)) return null;
    return {
      filename: "prismelo.png",
      path: LOGO_FILE,
      cid: LOGO_CID,
      contentDisposition: "inline",
    };
  } catch {
    return null;
  }
}

export function readMailLog(): MailLogEntry[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(LOG_FILE, "utf8")) as unknown;
    return Array.isArray(parsed) ? (parsed as MailLogEntry[]) : [];
  } catch {
    return [];
  }
}

function record(entry: MailLogEntry) {
  const next = [entry, ...readMailLog()].slice(0, LOG_LIMIT);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporary = `${LOG_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, LOG_FILE);
}

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Turns bare URLs in a footer line into real links. */
function linkify(value: string) {
  return escape(value).replace(
    /https?:\/\/[^\s<]+/g,
    (url) =>
      `<a href="${url}" style="color:#161616;text-decoration:underline">${url}</a>`,
  );
}

/** Escapes a message body and keeps its paragraph breaks. */
function paragraphsToHtml(text: string) {
  return escape(text)
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n/g, "<br />"))
    .join('<br /><br />');
}

export type EmailDetails = Array<{ label: string; value: string }>;

export type EmailContent = {
  kicker?: string;
  heading: string;
  paragraphs?: string[];
  details?: EmailDetails;
  quote?: string;
  action?: { label: string; href: string };
  footer?: string;
  preheader?: string;
};

export function renderEmail({
  kicker,
  heading,
  paragraphs,
  details,
  quote,
  action,
  footer,
  preheader,
  logoUrl = LOGO_URL,
}: EmailContent & { logoUrl?: string }) {
  const text = [
    ...(kicker ? [kicker, ""] : []),
    heading,
    "",
    ...(paragraphs ?? []).flatMap((paragraph) => [paragraph, ""]),
    ...(details ?? []).map((row) => `${row.label}: ${row.value}`),
    ...(details && details.length > 0 ? [""] : []),
    ...(quote ? [quote, ""] : []),
    ...(action ? [`${action.label}: ${action.href}`, ""] : []),
    ...(footer ? [footer, ""] : []),
    `${site.legalName} — ${SITE_HOST}`,
    `Contact: ${site.contactEmail}`,
  ].join("\n");

  const fontStack =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  const detailRows = (details ?? [])
    .map((row) => {
      const isEmail = row.value.includes("@") && !row.value.includes(" ");
      const value = isEmail
        ? `<a href="mailto:${escape(row.value)}" style="color:#0b0b0b;text-decoration:none">${escape(row.value)}</a>`
        : escape(row.value);
      return [
        '<tr>',
        `<td style="padding:9px 0;border-bottom:1px solid #eeeeea;width:96px;vertical-align:top;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#9a9a96">${escape(row.label)}</td>`,
        `<td style="padding:9px 0 9px 16px;border-bottom:1px solid #eeeeea;font-size:14px;line-height:1.55;color:#0b0b0b">${value}</td>`,
        "</tr>",
      ].join("");
    })
    .join("");

  const html = [
    preheader
      ? `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:transparent">${escape(preheader)}</div>`
      : "",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1ee;margin:0;padding:0">`,
    '<tr><td align="center" style="padding:30px 12px">',
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e3e3df;border-radius:14px;overflow:hidden;font-family:${fontStack}">`,

    // Header: mark + wordmark, on the brand black.
    '<tr><td style="background:#08080a;padding:22px 32px">',
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>',
    `<td width="34" valign="middle"><img src="${escape(logoUrl)}" width="34" height="34" alt="Prismelo" style="display:block;width:34px;height:34px;border:0;outline:none;text-decoration:none" /></td>`,
    '<td valign="middle" style="padding-left:13px">',
    '<div style="font-size:15px;line-height:1;font-weight:700;letter-spacing:.32em;color:#ffffff">PRISMELO</div>',
    '<div style="margin-top:5px;font-size:8.5px;line-height:1;font-weight:500;letter-spacing:.3em;color:#a3a3a3">TECHNOLOGY</div>',
    "</td>",
    "</tr></table>",
    "</td></tr>",
    '<tr><td style="height:3px;background:#c3f24f;font-size:0;line-height:0">&nbsp;</td></tr>',

    // Body.
    '<tr><td style="padding:34px 32px 30px">',
    kicker
      ? `<div style="margin:0 0 12px;font-size:10px;line-height:1;letter-spacing:.2em;text-transform:uppercase;color:#8c8c88">${escape(kicker)}</div>`
      : "",
    `<h1 style="margin:0 0 16px;font-size:21px;line-height:1.35;font-weight:600;color:#0b0b0b;letter-spacing:-.01em">${escape(heading)}</h1>`,
    ...(paragraphs ?? []).map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3a3a3a">${paragraphsToHtml(paragraph)}</p>`,
    ),
    detailRows
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;border-top:1px solid #eeeeea">${detailRows}</table>`
      : "",
    quote
      ? [
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0">',
          '<tr><td style="background:#fafaf7;border-left:3px solid #0b0b0b;padding:18px 20px">',
          `<div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#8c8c88;margin-bottom:10px">Message</div>`,
          `<div style="font-size:14px;line-height:1.75;color:#1d1d1d">${paragraphsToHtml(quote)}</div>`,
          "</td></tr></table>",
        ].join("")
      : "",
    action
      ? [
          '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 0"><tr>',
          `<td align="center" bgcolor="#0b0b0b" style="border-radius:999px">`,
          `<a href="${escape(action.href)}" style="display:inline-block;padding:13px 24px;font-size:13px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:999px">${escape(action.label)}</a>`,
          "</td></tr></table>",
        ].join("")
      : "",
    "</td></tr>",

    // Footer.
    '<tr><td style="padding:24px 32px 26px;background:#fbfbf9;border-top:1px solid #ececea">',
    ...(footer
      ? footer
          .split(/\n+/)
          .filter((line) => line.trim().length > 0)
          .map(
            (line) =>
              `<p style="margin:0 0 8px;font-size:11.5px;line-height:1.6;color:#8c8c88">${linkify(line.trim())}</p>`,
          )
      : []),
    '<p style="margin:14px 0 0;font-size:11.5px;line-height:1.6;color:#8c8c88">',
    `<span style="color:#161616;font-weight:600">${escape(site.legalName)}</span> · `,
    `<a href="${site.url}" style="color:#161616;text-decoration:none">${SITE_HOST}</a> · `,
    `<a href="mailto:${site.contactEmail}" style="color:#161616;text-decoration:none">${site.contactEmail}</a>`,
    "</p>",
    "</td></tr>",

    "</table>",
    '<div style="font-family:' +
      fontStack +
      ';margin-top:14px;font-size:10.5px;line-height:1.6;color:#a0a09c;text-align:center">',
    `Sent by ${escape(site.legalName)} · ${SITE_HOST}`,
    "</div>",
    "</td></tr>",
    "</table>",
  ].join("");

  return { text, html };
}

/**
 * Renders and sends one branded message. The logo travels with the message as
 * an inline attachment, so the header is intact even when a client blocks
 * remote images or the public URL has not been deployed yet.
 */
export async function deliverBranded({
  to,
  subject,
  replyTo,
  content,
}: {
  to: string;
  subject: string;
  replyTo?: string;
  content: EmailContent;
}): Promise<
  | { ok: true; text: string; html: string }
  | { ok: false; reason: "not_configured" | "failed"; error?: string; text: string; html: string }
> {
  const logo = logoAttachment();
  const { text, html } = renderEmail(
    logo ? { ...content, logoUrl: `cid:${LOGO_CID}` } : content,
  );

  const delivery = await deliverMail({
    to,
    subject,
    replyTo,
    text,
    html,
    attachments: logo ? [logo] : undefined,
  });

  if (delivery.ok) return { ok: true, text, html };
  return delivery.reason === "failed"
    ? { ok: false, reason: "failed", error: delivery.error, text, html }
    : { ok: false, reason: "not_configured", text, html };
}

export async function sendMail({
  to,
  subject,
  kind,
  ...content
}: EmailContent & { to: string; subject: string; kind: MailKind }): Promise<MailLogEntry> {
  const entry: MailLogEntry = {
    id: newId("mail"),
    at: new Date().toISOString(),
    to,
    subject,
    kind,
    status: "skipped",
  };

  if (!emailConfigured()) {
    entry.error =
      "No email relay configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS and EMAIL_FROM to send notifications.";
    record(entry);
    return entry;
  }

  const delivery = await deliverBranded({
    to,
    subject,
    replyTo: process.env.CONTACT_TO_EMAIL?.trim() || site.contactEmail,
    content,
  });

  if (!delivery.ok) {
    entry.status = "failed";
    entry.error =
      delivery.reason === "failed" ? delivery.error : "No email relay configured.";
    console.error("notification delivery failed", kind, entry.error);
  } else {
    entry.status = "sent";
  }

  record(entry);
  return entry;
}
