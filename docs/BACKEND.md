# Backend

The site is a Node.js server (Next.js App Router). Nothing here runs on the
client, and no environment variable is prefixed `NEXT_PUBLIC_` — every secret
stays in the server process.

## Server routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/contact` | POST | Contact form: validates, rate limits, emails the enquiry |
| `/api/subscribe` | POST | Adds an email to the article list |
| `/api/subscribe/unsubscribe` | POST | Removes it using a signed token |
| `/api/community/register` | POST | Creates a community account |
| `/api/community/login` | POST | Signs in (sets a session cookie) |
| `/api/community/logout` | POST | Clears the session |
| `/api/community/threads` | POST | Starts a discussion |
| `/api/community/threads/[slug]/replies` | POST | Replies, notifies participants |
| `/api/admin/login` · `/logout` | POST | Admin session |
| `/api/admin/resources` · `[slug]` | POST/PATCH/DELETE | Create, edit, publish, delete posts |
| `/api/admin/notify-legal` | POST | Sends a policy-change notice |

Every mutating route checks `isSameOriginRequest()` and, where it is private,
`isAdmin()` first. Bodies are read through `lib/request.ts`, which enforces a
size cap (413 above it) before parsing.

## Storage

There is no external database. Two places on the server's disk:

- `content/resources/*.mdx` — published posts (`slug.mdx`) and drafts (`_slug.mdx`).
- `data/community.json` — accounts, threads, replies, subscribers.
- `data/email-log.json` — the last 200 delivery attempts.

Writes are atomic: a temporary file is written then renamed, so a crash cannot
leave half a file behind. `data/` is gitignored because it holds personal data,
and it is never imported by anything that renders that directory.

This means the site needs a persistent disk. On a serverless host the filesystem
is ephemeral and posts/accounts written there disappear on redeploy — use a Node
server, or move both to a database.

## Authentication

- **Admin** — one password (`ADMIN_PASSWORD`). The session is a signed cookie
  (`prismelo_admin`, 8 hours): an expiry timestamp plus an HMAC keyed by
  `ADMIN_SESSION_SECRET`. Compared with `timingSafeEqual`, so it cannot be
  forged or extended.
- **Community** — accounts with a scrypt-hashed password, and a separate signed
  session cookie. No third-party identity provider.

Both refuse to sign anyone in when their secret is unset, rather than falling
back to a guessable default.

## Email

One transport, one template:

```
api/contact  ─┐
lib/notify.ts ─┼─> lib/email.ts (renderEmail) ─> lib/mailer.ts (nodemailer/SMTP)
```

- `lib/mailer.ts` builds one pooled SMTP transport from `SMTP_HOST`,
  `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and reports delivered / not configured /
  failed. A caller can never report a send that did not happen.
- `lib/email.ts` renders the branded table layout (logo header, heading, field
  table, message block, button, contact footer). The logo is `public/email-logo.png`
  attached inline as `cid:` so it shows even when a client blocks remote images.
- `lib/notify.ts` fans notifications out in small batches; a failure never turns
  a successful forum post into an error, it is recorded in the email log instead.

The contact route returns `501 delivery_not_configured` when there are no SMTP
credentials and `502 delivery_failed` when the relay rejects a message — never a
fake success.

## Environment

All variables are documented, with placeholders only, in `.env.example`.
`.env` holds the live values for this deployment (see README: the repository is
private). `npm run setup:env` writes an alternative `.env.production` from
prompts on any machine.

| Variable | Used for |
| --- | --- |
| `SMTP_HOST` · `SMTP_PORT` · `SMTP_USER` · `SMTP_PASS` | Mail relay |
| `CONTACT_FROM_EMAIL` · `CONTACT_TO_EMAIL` · `EMAIL_FROM` | Sender and destination |
| `ADMIN_PASSWORD` | `/admin` sign-in |
| `ADMIN_SESSION_SECRET` | Signature key for the admin cookie |
| `COMMUNITY_SESSION_SECRET` | Signature key for community cookies |

## Security posture

- Security headers in `next.config.ts`: `nosniff`, `SAMEORIGIN`, referrer policy,
  permissions policy, COOP, no DNS prefetch, HSTS and a strict CSP in production.
- Contact form: server-side validation, honeypot field, in-memory rate limit
  (5 per 15 minutes per address) and a request body cap.
- Submitted text is escaped before it is put into HTML email.
- Session cookies are `httpOnly`, `sameSite=lax`, `secure` in production.
- Secrets are read only in server modules; the built client bundles were checked
  to contain no key material.
- `/admin` is `noindex` and disallowed in `robots.txt`.
