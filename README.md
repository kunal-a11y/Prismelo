# Prismelo.tech

Corporate website for Prismelo.tech — a technology and cybersecurity company.
Built with Next.js (App Router), TypeScript and Tailwind CSS v4.

Monochrome by design: black base, white ink, neutral grey, hairline borders.
No accent colours, no gradients, no stock photography.

## Requirements

- Node.js 20+ (developed on Node 24)
- npm (lockfile committed)

## Getting started

```bash
npm install
npm run dev
```

The dev server prints its URL. If port 3000 is already in use, Next picks the
next available port — use the URL it prints rather than assuming 3000.

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # TypeScript check (tsc --noEmit)
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home |
| `/about` | Company, mission, philosophy, expertise |
| `/companies` | Group structure; HirenextAI |
| `/services` | Service index and engagement models |
| `/services/[slug]` | Seven service pages (static params) |
| `/founder` | Kunal Purohit |
| `/docs/[[...slug]]` | Documentation portal (MDX) |
| `/community` | Community index (live forum) |
| `/community/c/[category]` | Category listing |
| `/community/t/[slug]` | Discussion + replies |
| `/community/u/[username]` | Public profile (noindex) |
| `/community/new` | Start a discussion (signed in) |
| `/community/login`, `/community/register` | Forum accounts |
| `/unsubscribe` | Email unsubscribe (token link) |
| `/admin/community` | Forum moderation (admin only) |
| `/resources` | Article index (sample content) |
| `/resources/[slug]` | Article detail |
| `/contact` | Contact form + company details |
| `/privacy`, `/terms` | Legal |
| `/api/contact` | Contact form handler |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Generated SEO assets |

## Structure

```
app/                 routes, metadata, error/loading/not-found states
components/          design system + feature components
  art.tsx            original monochrome SVG illustrations
  docs/              docs shell, search, TOC, code blocks
  community/         discussion list, auth forms, reply composer, avatars
  contact/           contact form
  resources/         article index and art
content/
  docs/              documentation articles (MDX)
  resources/         sample articles (MDX)
data/                forum + email log (gitignored, created at runtime)
lib/                 data and content loaders
```

### Design system

Tokens live in `app/globals.css` under `@theme`:

| Token | Value |
| --- | --- |
| `--color-base` | `#000000` |
| `--color-ink` | `#FFFFFF` |
| `--color-muted` | `#A0A0A0` |
| `--color-line` | `#252525` |
| `--color-surface` | `#0A0A0A` |

Fluid type utilities: `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-lead`,
`.t-body`, `.t-label`, `.t-mono`. Motion uses one easing curve and is disabled
under `prefers-reduced-motion`.

Typography is Geist / Geist Mono via `next/font`.

## Documentation

Articles are MDX files in `content/docs`. Navigation, ordering and sidebar
labels are declared in `DOC_NAV` in `lib/docs.ts`. Frontmatter supplies
`title`, `description` and `status` (`Published` or `Placeholder`).

Headings become the table of contents, and the search index is generated from
navigation, frontmatter and headings at build time. No external search service.

MDX is rendered with `next-mdx-remote/rsc`. Because documentation is authored in
this repository (trusted), `blockJS` is disabled so component props can be
passed; dangerous globals remain blocked via `blockDangerousJS`.

## Contact form delivery — integration point

`app/api/contact/route.ts` validates submissions server-side, applies a
honeypot and per-instance rate limiting, then delivers through a transactional
email provider.

Configure in `.env.local` (see `.env.example`):

```bash
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

Without these values the route returns **501 `delivery_not_configured`**. The
form then shows an explicit notice and a prefilled mailto fallback — it does not
display a success state. This is intentional: nothing claims to be delivered
when it was not.

To use a different provider, change the `fetch` block in the route; the form
treats delivery as opaque. Full contract: `/docs/guides/contact-form-integration`.

## Community (forum)

The community is live. Reading is open; posting needs an account, created at
`/community/register` with a name, email and password. Passwords are stored as
scrypt hashes and the session is a signed, HttpOnly cookie (`prismelo_community`,
30 days). Data lives in `data/community.json` — gitignored, because it holds
email addresses and password hashes.

Members can start a thread (`/community/new`), reply to open threads, and have a
public profile at `/community/u/<handle>`. Emails are never displayed publicly.
Admins moderate at `/admin/community`: lock or pin threads, delete threads (with
their replies), delete individual replies, remove subscribers, and see the
email log.

Signing key: `COMMUNITY_SESSION_SECRET`, falling back to `ADMIN_SESSION_SECRET`
and then `ADMIN_PASSWORD`. With none set, registration is refused rather than
using a guessable key.

Storage is a JSON file, so the forum needs the same writable, persistent disk as
the publishing area: a self-hosted Node server.

## Notification email

Four events send mail through the Resend account already used by the contact
form:

| Event | Recipients |
| --- | --- |
| An article is published | every active subscriber |
| A forum account is created | the new member |
| A thread is created | its author |
| A reply is posted | the thread author and everyone who already replied, except the replier |

Configure with `RESEND_API_KEY` and `EMAIL_FROM` (a verified sender; falls back
to `CONTACT_FROM_EMAIL`). Without them nothing is sent, every attempt is logged
as `skipped`, and `/admin/community` shows a configuration notice — no email is
ever reported as sent when it was not. Delivery outcomes are kept in
`data/email-log.json`.

Article emails come only from the form on `/resources` or from a forum account —
a website cannot harvest addresses from visitors, so the list is opt-in. Every
article email carries a per-recipient unsubscribe link (`/unsubscribe?token=…`).
Unsubscribing stops article emails; reply notifications are separate.

The only email that is never sent automatically is a policy-change notice. See
below.

## Policy notices

`/admin/notifications` tracks the privacy policy and terms by hashing their
source files. When a hash differs from the last recorded version, the page says
so and offers two actions: email subscribers a short notice, or record the
current version without emailing. Nothing goes out on a code edit — a change to
a policy is announced by a person who has read the diff.

## Security

- **Passwords** are salted scrypt hashes (`scrypt:<salt>:<hash>`) and cannot be
  reversed. Neither Prismelo nor anyone with the data file can read them.
- **Sessions** are HMAC-signed HttpOnly cookies (`prismelo_admin`,
  `prismelo_community`), `SameSite=Lax`, and `Secure` in production. The subject
  id and expiry live inside the signed payload, never in a client-supplied field.
- **Writes** check the session on the server and reject cross-origin requests.
  A missing Origin header is accepted so command-line clients work; cookies are
  `SameSite=Lax`, so a browser cannot attach them cross-site anyway.
- **Rate limits** apply to admin sign-in (8 per 15 minutes), community sign-in
  and registration, and subscriptions. Comparison of secrets uses
  `timingSafeEqual`; an unknown email still performs a hash comparison so the
  response time does not reveal whether an account exists.
- **Request bodies** are capped (4 KB for credentials, 32–256 KB for content) and
  every field has a length limit.
- **User content** is rendered as text through JSX, never as HTML, so a thread
  containing `<script>` is displayed literally. Email HTML is escaped.
- **Headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and in production HSTS and
  a Content-Security-Policy restricted to this origin.
- **Redirects** after sign-in accept same-site paths only; `//host` and
  backslash variants fall back to `/community`.
- **Data** (`data/`) is gitignored and lives outside `public/`, so it is never
  served as a static file.
- No analytics, advertising scripts or third-party embeds are loaded.

No system is proven free of vulnerabilities by a checklist. This code has not
had an independent penetration test; before a high-traffic launch, have someone
test it against the deployment, including the email provider configuration.

## Performance

The marketing pages are statically prerendered; the community and admin pages
are rendered per request. Measured locally with `time_starttransfer`:

| Route | `next dev` | `next start` (production) |
| --- | --- | --- |
| `/` | ~0.73–0.90 s | ~0.010–0.017 s |
| `/resources` | ~0.44–5.96 s | ~0.008–0.068 s |
| `/community` | ~0.28–2.02 s | ~0.031–0.160 s |
| `/community/login` | ~0.26–0.34 s | ~0.027–0.040 s |

The dev figures include compiling routes on first request, which is why they are
an order of magnitude slower. For a fast site, run `npm run build && npm start`
— not `next dev`. Community data is read once per request through a React
`cache` wrapper, so a page that needs threads, categories and counts pays for
one file read, not several.

## Publishing a Resources post

Publishing happens in the browser at `/admin` — no code, no terminal. Set a
password once, then write posts from the admin area:

```bash
# .env.local
ADMIN_PASSWORD=choose-a-long-password
```

Restart the server and open `/admin`. Sign in, press **New post**, fill in the
title, the one-sentence description, the category and the article, then save.
The draft checkbox keeps a post hidden; untick it (or use **Publish** in the
post list) to make it live. **Feature on the index** puts a post in the large
slot at the top of `/resources`.

The admin area can also edit, publish/unpublish and delete existing posts. It is
marked `noindex` and disallowed in `robots.txt`. Sign-in lives at
`/admin/login`.

### Where the content lives

Every `.mdx` file in `content/resources` is a post; there is no index to edit.
Published posts are `slug.mdx`; drafts are `_slug.mdx` and are ignored by the
site. The admin area writes exactly these files, so posts created by hand or
from the admin area are interchangeable. Reading time is calculated from the
word count, and the URL (`/resources/<slug>`) is fixed after the first save so
published links never break.

`npm run new:post` still exists as an optional command-line scaffold for bulk
or scripted work.

Writes go to the server's filesystem, so `/admin` works on a self-hosted Node
server (`npm run dev`, `npm start`). On a serverless host such as Vercel the
filesystem is read-only and ephemeral: publish there by committing the `.mdx`
file, or move content to a database.

## Content honesty rules

This site deliberately contains no invented founding dates, employee counts,
office locations, certifications, client names, revenue, awards or statistics.
New subsidiaries are not announced before they exist. Placeholder documentation
is marked as such, and sample articles/community content are labelled.

If a page or article is marked sample content, it is demonstration material.

## Deployment

Static routes are prerendered; `/api/contact`, the `/api/community` routes and
the `/admin` API routes run on the Node.js runtime. Set the delivery environment
variables in the deployment environment if email is to be sent, and
`ADMIN_PASSWORD` if the admin area is to accept sign-ins.

The admin area and the forum both need a writable filesystem. On a serverless
deployment the filesystem is ephemeral, so posts, threads and the email list
written there would disappear on redeploy — keep the site on a Node server, or
move both to a database.
