# Security

What protects the site, what each measure is actually for, and where the honest
limit is. Two runtimes are covered: the Next app and the Cloudflare Worker in
[`workers/api`](../workers/api/README.md). They share the same secrets and the
same session format.

## Secrets

| Secret | Protects | If it leaks |
| --- | --- | --- |
| `SMTP_PASS` | Sending mail as prismelo.tech | Someone can send mail through your Brevo account |
| `ADMIN_PASSWORD` | The admin area | Full control of posts and moderation |
| `ADMIN_SESSION_SECRET` | Admin cookies | Forged admin sessions (not the password itself) |
| `COMMUNITY_SESSION_SECRET` | Member cookies | Forged member sessions |
| `DATA_KEY` | Encrypted emails in the database | Every stored address becomes readable |
| `PASSWORD_PEPPER` | Password hashes | Offline cracking of a stolen database becomes practical |

None of them are prefixed `NEXT_PUBLIC_`, so Next never inlines them into a
client bundle. This is checked, not assumed: the production build's
`.next/static` and prerendered pages were searched for the real values and
contain nothing.

Rotating a key that was committed (`.env` is committed because the repository is
private) means changing it in `.env` **and** in Cloudflare, then redeploying.

## Passwords

- `HMAC-SHA256(pepper, password)` → `PBKDF2-SHA256`, 210,000 iterations, 16-byte
  random salt per password. Stored as `pbkdf2h:iterations:salt:hash`.
- The **salt** stops one rainbow table covering every account.
- The **pepper** lives in a Worker secret, not the database, so a stolen dump
  cannot be cracked without also stealing the secret.
- Verification compares the derived bytes in constant time. The admin password
  is compared **character by character** to the end of the longer string with
  the length folded in, because `given === expected` stops at the first
  difference and that timing tells an attacker how much of the guess was right.
- Failed sign-ins are counted per IP in D1 and refused after 10 in 15 minutes —
  in the database, not in memory, so a cold start does not reset the counter.

## Data at rest

- User and subscriber email addresses are **AES-256-GCM** ciphertext:
  `enc:v1:<iv>:<ciphertext>`. A fresh random IV per value, and GCM authenticates,
  so an edited ciphertext fails to decrypt rather than returning something
  attacker-chosen.
- Ciphertext cannot be queried, so each row also carries an **HMAC-SHA256 blind
  index** derived from `DATA_KEY` under a separate HKDF label. Uniqueness lives
  on the blind index, since `UNIQUE(email)` can no longer mean anything.
- Forum posts, thread titles and admin text are not encrypted: they are public
  content that the site renders, and encrypting them would break search,
  moderation and email notifications for no benefit.

## In transit

- HTTPS everywhere (Cloudflare or the host terminates TLS; HSTS is sent).
- Mail leaves over implicit TLS on port 465. Port 25 is blocked by Cloudflare,
  which is why 465 is the only supported SMTP port in the Worker.
- The API's CORS allowlist is explicit (`ALLOWED_ORIGINS`), mutations from a
  foreign origin get a 403, and every JSON response carries `no-store`,
  `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  a restrictive `Permissions-Policy` and a `default-src 'none'` CSP.

## Sessions

- Format: `base64url(payload).base64url(HMAC-SHA256)`. The expiry is inside the
  signed payload; nothing is read from it before the signature matches.
- Cookies are `HttpOnly`, `SameSite=Lax`, `Secure`, scoped to `/`.
- A token edited by a single character is rejected — this is a smoke-test case,
  not a hope.
- The admin cookie lasts 8 hours, a member cookie 30 days.

## Abuse

- Contact: honeypot field plus 5 submissions per 15 minutes per IP.
- Registration 5/hour, sign-in 10/15 min, threads 10/hour, replies 20/10 min.
- JSON bodies are capped (32 KB by default, 4 KB on subscribe, 256 KB on posts)
  before parsing, so a large body is refused rather than buffered.
- Markdown is stored as text and never rendered to HTML by the API.

## Audit trail

`GET /api/admin/audit` returns the last 500 events: admin sign-ins, refused
admin sign-ins, community sign-ins and refusals, and registrations — each with a
timestamp, an IP and a username. No password, token or full email address is
ever written to it, and the smoke test asserts that.

## About end-to-end encryption

End-to-end encryption means the server cannot read the data: keys exist only on
the client. That is incompatible with this backend, which has to render forum
threads, send notification email and let an admin moderate. Calling anything
here "E2E" would be misleading.

What is real: TLS in transit, AES-256-GCM at rest with the key outside the
database, peppered password hashing, and blind indexes so encryption does not
cost the ability to look a user up. If you want a feature where the server
genuinely cannot read the content — encrypted private messages between two
members, for example — that is a separate design with client-held keys, and it
can be built on top of this without pretending the rest is E2E.

## Known limits

- **No email verification.** Anyone can register with an address they do not
  own. Adding a confirmation link is the next hardening step.
- **No password reset.** Losing a password means asking an admin.
- **No 2FA** on the admin account; it is one long password.
- **Rate limits are per IP.** A distributed attacker gets more attempts.
- **Scrypt hashes from the Next app cannot be verified by the Worker.** No
  accounts existed when the Worker was written, so nothing is affected today.
