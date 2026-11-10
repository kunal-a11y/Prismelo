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
import {
  COMMUNITY_COOKIE,
  COMMUNITY_MAX_AGE,
  clearCookie,
  createCommunityToken,
  hashPassword,
  requestToken,
  sessionCookie,
  slugify,
  verifyCommunityToken,
  verifyPassword,
} from "../auth";
import {
  audit,
  createReply,
  createThread,
  findThreadBySlug,
  findUserByEmail,
  findUserById,
  hitRateLimit,
  createUser,
  listThreads,
  newId,
  publicUser,
  recordMail,
  repliesForThread,
  threadParticipants,
  userNames,
  usernameTaken,
  type User,
} from "../db";
import { mailerConfigured, renderEmail, sendMail } from "../mail";

async function currentUser(ctx: Ctx): Promise<User | null> {
  const token = requestToken(ctx.request, COMMUNITY_COOKIE);
  const userId = await verifyCommunityToken(ctx.env, token);
  if (!userId) return null;
  return findUserById(ctx.env, userId);
}

/** A unique handle derived from the display name, then the email prefix. */
async function uniqueUsername(ctx: Ctx, name: string, email: string): Promise<string> {
  const base = slugify(name, "member");
  if (!(await usernameTaken(ctx.env, base))) return base;

  const fallback = slugify(email.split("@")[0] ?? "", base);
  if (!(await usernameTaken(ctx.env, fallback))) return fallback;

  for (let suffix = 2; suffix < 500; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!(await usernameTaken(ctx.env, candidate))) return candidate;
  }
  return `${base}-${newId("u").slice(2, 8)}`;
}

function sessionResponse(ctx: Ctx, user: User, token: string): Response {
  return json(
    { ok: true, token, user: publicUser(user) },
    {
      env: ctx.env,
      request: ctx.request,
      headers: { "Set-Cookie": sessionCookie(ctx.env, COMMUNITY_COOKIE, token, COMMUNITY_MAX_AGE) },
    },
  );
}

/* ------------------------------------------------------------------ register */

type RegisterPayload = { name: string; email: string; password: string; bio?: string };

export async function register(ctx: Ctx): Promise<Response> {
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const parsed = await readJson<RegisterPayload>(ctx);
  if (!parsed.ok) return parsed.response;

  const name = cleanText(parsed.data.name, 2, MAX.name);
  const email = cleanEmail(parsed.data.email);
  const password = typeof parsed.data.password === "string" ? parsed.data.password : "";

  const fields: Record<string, string> = {};
  if (!name) fields.name = "Use your name, at least 2 characters.";
  if (!email) fields.email = "Enter a valid email address.";
  if (password.length < 8 || password.length > MAX.password) {
    fields.password = "Passwords need at least 8 characters.";
  }
  if (Object.keys(fields).length > 0) {
    return json({ error: "Check the highlighted fields.", fields }, { status: 400, env: ctx.env, request: ctx.request });
  }

  const hits = await hitRateLimit(ctx.env, `register:${clientKey(ctx)}`, 60 * 60 * 1000);
  if (hits > 5) {
    return json({ error: "Too many attempts. Try again later." }, { status: 429, env: ctx.env, request: ctx.request });
  }

  if (await findUserByEmail(ctx.env, email!)) {
    return json(
      { error: "An account with that email already exists." },
      { status: 409, env: ctx.env, request: ctx.request },
    );
  }

  const user = await createUser(ctx.env, {
    username: await uniqueUsername(ctx, name!, email!),
    name: name!,
    email: email!,
    passwordHash: await hashPassword(password, ctx.env.PASSWORD_PEPPER ?? ""),
  });

  await audit(ctx.env, { event: "community.register", subject: user.username, ip: clientKey(ctx) });

  const token = await createCommunityToken(ctx.env, user.id);
  return sessionResponse(ctx, user, token);
}

/* --------------------------------------------------------------------- login */

export async function login(ctx: Ctx): Promise<Response> {
  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const parsed = await readJson<{ email: string; password: string }>(ctx);
  if (!parsed.ok) return parsed.response;

  const hits = await hitRateLimit(ctx.env, `login:${clientKey(ctx)}`, 15 * 60 * 1000);
  if (hits > 10) {
    return json({ error: "Too many attempts. Try again later." }, { status: 429, env: ctx.env, request: ctx.request });
  }

  if (!ctx.env.COMMUNITY_SESSION_SECRET && !ctx.env.ADMIN_SESSION_SECRET && !ctx.env.ADMIN_PASSWORD) {
    return json({ error: "Community accounts are not configured." }, { status: 503, env: ctx.env, request: ctx.request });
  }

  const email = cleanEmail(parsed.data.email);
  const password = typeof parsed.data.password === "string" ? parsed.data.password : "";
  const user = email ? await findUserByEmail(ctx.env, email) : null;

  // Same message and roughly the same work for "no such account" and "wrong
  // password", so the response cannot be used to enumerate accounts.
  const valid = user
    ? await verifyPassword(password, user.passwordHash, ctx.env.PASSWORD_PEPPER ?? "")
    : false;
  if (!user || !valid) {
    await audit(ctx.env, {
      event: user ? "community.login_failed" : "community.login_unknown",
      subject: user?.username ?? "",
      ip: clientKey(ctx),
    });
    return json(
      { error: "Email or password is incorrect." },
      { status: 401, env: ctx.env, request: ctx.request },
    );
  }

  await audit(ctx.env, { event: "community.login", subject: user.username, ip: clientKey(ctx) });

  const token = await createCommunityToken(ctx.env, user.id);
  return sessionResponse(ctx, user, token);
}

export async function logout(ctx: Ctx): Promise<Response> {
  return json(
    { ok: true },
    {
      env: ctx.env,
      request: ctx.request,
      headers: { "Set-Cookie": clearCookie(ctx.env, COMMUNITY_COOKIE) },
    },
  );
}

export async function me(ctx: Ctx): Promise<Response> {
  const user = await currentUser(ctx);
  if (!user) {
    return json({ error: "not_signed_in" }, { status: 401, env: ctx.env, request: ctx.request });
  }
  return json({ ok: true, user: publicUser(user) }, { env: ctx.env, request: ctx.request });
}

/* -------------------------------------------------------------------- threads */

export async function threads(ctx: Ctx): Promise<Response> {
  return json({ threads: await listThreads(ctx.env) }, { env: ctx.env, request: ctx.request });
}

type ThreadPayload = { title: string; category: string; body: string };

export async function createThreadRoute(ctx: Ctx): Promise<Response> {
  const user = await currentUser(ctx);
  if (!user) {
    return json({ error: "Sign in to start a discussion." }, { status: 401, env: ctx.env, request: ctx.request });
  }

  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const parsed = await readJson<ThreadPayload>(ctx, 48 * 1024);
  if (!parsed.ok) return parsed.response;

  const title = cleanText(parsed.data.title, 6, MAX.title);
  const body = cleanText(parsed.data.body, 20, MAX.body);
  const category = cleanText(parsed.data.category, 2, 40) ?? "General";

  const fields: Record<string, string> = {};
  if (!title) fields.title = "Give the thread a title of 6 to 140 characters.";
  if (!body) fields.body = "Add at least 20 characters so people can reply.";
  if (Object.keys(fields).length > 0) {
    return json({ error: "Check the highlighted fields.", fields }, { status: 400, env: ctx.env, request: ctx.request });
  }

  const hits = await hitRateLimit(ctx.env, `threads:${user.id}`, 60 * 60 * 1000);
  if (hits > 10) {
    return json({ error: "You have started several threads recently. Try again later." }, { status: 429, env: ctx.env, request: ctx.request });
  }

  const base = slugify(title!, "thread");
  let slug = base;
  for (let attempt = 2; await findThreadBySlug(ctx.env, slug); attempt += 1) {
    slug = `${base}-${attempt}`;
    if (attempt > 50) {
      slug = `${base}-${newId("t").slice(2, 8)}`;
      break;
    }
  }

  const thread = await createThread(ctx.env, { slug, title: title!, category: category!, body: body!, authorId: user.id });
  return json({ ok: true, slug: thread.slug }, { env: ctx.env, request: ctx.request });
}

export async function thread(ctx: Ctx): Promise<Response> {
  const found = await findThreadBySlug(ctx.env, ctx.params.slug);
  if (!found) {
    return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });
  }

  const [replies, authors] = await Promise.all([
    repliesForThread(ctx.env, found.id),
    userNames(ctx.env, [found.authorId]),
  ]);

  return json(
    {
      thread: {
        ...found,
        author: authors.get(found.authorId) ?? null,
        replies,
      },
    },
    { env: ctx.env, request: ctx.request },
  );
}

/* -------------------------------------------------------------------- replies */

export async function replyRoute(ctx: Ctx): Promise<Response> {
  const user = await currentUser(ctx);
  if (!user) {
    return json({ error: "Sign in to reply." }, { status: 401, env: ctx.env, request: ctx.request });
  }

  const rejected = originRejected(ctx);
  if (rejected) return rejected;

  const found = await findThreadBySlug(ctx.env, ctx.params.slug);
  if (!found) {
    return json({ error: "not_found" }, { status: 404, env: ctx.env, request: ctx.request });
  }
  if (found.locked) {
    return json({ error: "This thread is locked." }, { status: 403, env: ctx.env, request: ctx.request });
  }

  const parsed = await readJson<{ body: string }>(ctx);
  if (!parsed.ok) return parsed.response;

  const body = cleanText(parsed.data.body, 2, MAX.body);
  if (!body) {
    return json(
      { error: "Check the highlighted fields.", fields: { body: "Write a reply first." } },
      { status: 400, env: ctx.env, request: ctx.request },
    );
  }

  const hits = await hitRateLimit(ctx.env, `replies:${user.id}`, 10 * 60 * 1000);
  if (hits > 20) {
    return json({ error: "Slow down a moment." }, { status: 429, env: ctx.env, request: ctx.request });
  }

  const reply = await createReply(ctx.env, { threadId: found.id, body, authorId: user.id });

  // Notify the thread's participants. A mail failure is logged and ignored:
  // the reply itself is already saved and must not be reported as failed.
  if (mailerConfigured(ctx.env)) {
    try {
      const participants = await threadParticipants(ctx.env, found.id);
      const emails: string[] = [];
      for (const id of participants) {
        if (id === user.id) continue;
        const person = await findUserById(ctx.env, id);
        if (person?.email) emails.push(person.email);
      }

      if (emails.length > 0) {
        const content = renderEmail({
          kicker: "New reply",
          heading: `New reply in ${found.title}`,
          details: [
            { label: "From", value: user.name },
            { label: "Thread", value: found.title },
          ],
          quote: body,
          action: { label: "Read the thread", href: `https://prismelo.tech/community/${found.slug}` },
          footer: "You are receiving this because you posted in this thread.",
        });
        const delivery = await sendMail(ctx.env, {
          to: emails.slice(0, 20).join(", "),
          subject: `New reply in ${found.title}`,
          html: content.html,
          text: content.text,
        });
        await recordMail(ctx.env, {
          kind: "reply",
          status: delivery.ok ? "sent" : delivery.reason === "not_configured" ? "skipped" : "failed",
          recipient: emails.slice(0, 20).join(", "),
          subject: `New reply in ${found.title}`,
          detail: delivery.ok ? "" : delivery.reason === "failed" ? delivery.error ?? "" : "not configured",
        });
      }
    } catch (error) {
      console.error("reply notification failed", error);
    }
  }

  return json({ ok: true, id: reply.id }, { env: ctx.env, request: ctx.request });
}
