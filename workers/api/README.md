# prismelo-api

The Prismelo Technology backend as a Cloudflare Worker: contact form, subscriptions,
community accounts, forum threads and admin tools, with **D1** for storage and
**SMTP over a TLS socket** for email.

It replaces the JSON file and `.mdx` files the Next app used. There is no Node
runtime here, so `nodemailer` and `fs` are gone — see "Why the code looks like
this" below.

Status: **runs and is tested locally.** It is not deployed yet, because this
machine is not authenticated with Cloudflare (see Deploy).

## What is where

```
src/index.ts          routes table + dispatch (no framework)
src/http.ts           JSON, CORS, body caps, origin checks, validators
src/auth.ts           PBKDF2 passwords, signed session tokens, cookies
src/db.ts             every SQL statement, typed
src/mail.ts           SMTP client over cloudflare:sockets + email template
src/routes/*.ts       public, community and admin handlers
migrations/0001_init.sql   D1 schema
scripts/seed.mjs      turns content/resources/*.mdx into seed.sql
test/smoke.mjs        41 end-to-end checks against a running worker
```

## Run it locally

```bash
cd workers/api
npm install

# local secrets (gitignored)
cp .dev.vars.example .dev.vars   # then edit ADMIN_PASSWORD

npx wrangler d1 migrations apply prismelo --local
node scripts/seed.mjs
npx wrangler d1 execute prismelo --local --file=seed.sql

npm run dev        # http://127.0.0.1:8787
npm run smoke      # in a second terminal
```

The smoke suite covers health, CORS, origin rejection, validation, the honeypot,
registration and login, threads and replies, admin auth, post create/publish/delete,
draft visibility, subscriptions and rate limiting.

### Proven, locally

- 41/41 smoke checks pass against `wrangler dev` with real local D1.
- A contact submission sent **a real email through Brevo over TLS** (`POST /api/contact`
  returned `200` in ~1.2s, and D1 logged `sent` for `hello@prismelo.tech`).
- No `nodejs_compat` flag and no Node built-ins: it is a pure Workers bundle.

## Deploy

Cloudflare needs to know who you are before anything can be created:

```bash
cd workers/api
npx wrangler login          # opens the browser once
```

Then, in order:

```bash
# 1. create the database and copy its id into wrangler.jsonc
npx wrangler d1 create prismelo
#    -> paste the printed database_id over 00000000-0000-... in wrangler.jsonc

# 2. create the tables, then load the existing articles
npm run db:migrate
npm run db:seed:remote

# 3. secrets (each one prompts; the value is never echoed or committed)
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
npx wrangler secret put COMMUNITY_SESSION_SECRET
npx wrangler secret put DATA_KEY          # 32 random bytes, encrypts emails at rest
npx wrangler secret put PASSWORD_PEPPER   # 32 random bytes, mixed into password hashes
npx wrangler secret put SMTP_USER
npx wrangler secret put SMTP_PASS

# 4. deploy
npm run deploy
```

Non-secret settings (`SMTP_HOST`, `SMTP_PORT`, `CONTACT_TO_EMAIL`,
`CONTACT_FROM_EMAIL`, `ALLOWED_ORIGINS`) live in `wrangler.jsonc`.

`SMTP_PORT` must be **465**. Workers block port 25, and 587 needs a STARTTLS
upgrade the current relay path does not use here.

## Sessions and the one caveat

The site is on `prismelo.tech`; a Worker on `*.workers.dev` is a **different
site** to the browser, so a session cookie set there is third-party and modern
browsers drop it. Two supported options:

1. **Custom domain (recommended).** Add `api.prismelo.tech` as a Custom Domain
   for the Worker, then set `COOKIE_DOMAIN = .prismelo.tech`. Cookies become
   first-party and the admin/community UI works exactly like it does today.
2. **Bearer token.** Every login returns `{ ok, token, user }`. Send it as
   `Authorization: Bearer <token>` with `credentials: "include"` not required.
   This works from any origin but the token has to be kept somewhere
   script-reachable, so option 1 is better for the admin area.

Until then, the Worker still serves every read endpoint and the contact form —
those need no session at all.

## Endpoints

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/health` | — |
| POST | `/api/contact` | origin check + rate limit |
| POST | `/api/subscribe` · `/api/subscribe/unsubscribe` | origin check + rate limit |
| GET | `/api/resources` · `/api/resources/:slug` | — |
| POST | `/api/community/register` · `login` · `logout` | — |
| GET | `/api/community/me` | community session |
| GET/POST | `/api/community/threads` | session to post |
| GET | `/api/community/threads/:slug` | — |
| POST | `/api/community/threads/:slug/replies` | community session |
| POST | `/api/admin/login` · `logout` | — |
| GET/POST | `/api/admin/resources` | admin |
| PATCH/DELETE | `/api/admin/resources/:slug` | admin |
| GET | `/api/admin/community/threads` · `subscribers` · `mail` | admin |
| PATCH/DELETE | `/api/admin/community/threads/:id` · `replies/:id` · `subscribers/:id` | admin |
| POST | `/api/admin/notify-legal` | admin |

Errors are `{ error, fields? }` with the status that matches: `400` validation,
`401` not signed in, `403` foreign origin, `404`, `405`, `409` conflict,
`413` oversized body, `429` rate limited, `501` mail not configured,
`502` relay refused the message.

## Security notes

- **Personal data at rest:** user and subscriber email addresses are AES-256-GCM
  ciphertext (`enc:v1:<iv>:<ciphertext>`), so a leaked database dump or backup has
  no addresses in it. GCM means a tampered value fails to decrypt instead of
  yielding attacker-chosen text. Because ciphertext differs every time, lookups
  and uniqueness go through an HMAC-SHA256 **blind index** derived from the same
  key with a different HKDF label.
- **Passwords:** HMAC-SHA256(pepper, password) then PBKDF2-SHA256 at 210k
  iterations with a 16-byte random salt (`pbkdf2h:…`). Salts defeat rainbow
  tables; the pepper (`PASSWORD_PEPPER`) means a stolen database cannot be
  cracked offline without the Worker secret as well.
- **Comparison:** the admin password is compared one character at a time to the
  end of the longer string, with the length folded into the result —
  `given === expected` would return at the first wrong character and leak a
  position oracle. Password hashes use the same constant-time byte comparison.
- **Sessions:** `payload.signature`, HMAC-SHA256, expiry inside the signed
  payload. Nothing is read from the payload before the signature matches, and a
  token edited by one character is refused (covered by a smoke check).
- **Audit log:** admin and community sign-ins (successes and refusals) are
  recorded with an IP and a username — never a password or token, which is
  asserted by the smoke test. `GET /api/admin/audit` reads it.
- **Headers on every response:** `no-store`, `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer`, `Permissions-Policy`, HSTS and a
  `default-src 'none'` CSP — the API returns JSON only, so it needs nothing.
- All SQL uses bound parameters. Every route that mutates checks the origin.
- Rate limits live in D1 (`rate_limits`), not in memory, so they survive a cold
  start and apply across isolates.
- `wrangler secret put` keeps credentials out of `wrangler.jsonc` and git.
  `.dev.vars` is gitignored.
- Uploaded post bodies are markdown text; the API never renders HTML from them.

## About "end-to-end encryption"

True end-to-end encryption means the server cannot read the data — keys never
leave the client. That is impossible for this backend by definition: it renders
threads, sends notification email and lets an admin moderate, so it must read
what it stores. Implementing "E2E" here would either be theatre (a key stored
next to the ciphertext) or break every feature above.

What is implemented instead is the protection that actually applies:
TLS in transit (Cloudflare terminates HTTPS, and SMTP runs over implicit TLS),
AES-256-GCM at rest for personal data with the key outside the database, and
blind indexes so encryption does not cost the ability to query. If you later
want encrypted private messages where the server genuinely cannot read content,
that is a different feature and needs client-side keys — say so and it can be
designed properly.

## Why the code looks like this

- **No `nodemailer`.** It imports `net`. `connect()` from `cloudflare:sockets`
  is used instead, with implicit TLS on 465 and STARTTLS on 587.
- **No `fs`, no `.mdx` at runtime.** Posts are rows in `posts`, seeded from the
  existing files by `scripts/seed.mjs`.
- **No `node:crypto` scrypt.** WebCrypto only.
- **No ORM.** Twenty routes of typed SQL is smaller than the abstraction.

## Next step

The Next site still reads its own files. Switching it over means pointing its
`app/api/*` and `lib/community-store.ts` at this Worker (and, for the admin and
forum pages, moving those reads to this API). Say the word and that is the next
change.
