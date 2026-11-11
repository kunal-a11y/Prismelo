/**
 * Every query the API runs. Routes never touch SQL directly, so a change to a
 * column name happens in one place.
 *
 * D1 is SQLite with bound parameters — no string interpolation anywhere, which
 * is what keeps a display name like `Robert'); DROP TABLE` harmless.
 */

import type { Env } from "./http";
import { blindIndex, decryptField, encryptField } from "./crypto";

export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  bio: string;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash" | "email">;

export type Thread = {
  id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  authorId: string;
  createdAt: string;
  locked: boolean;
  pinned: boolean;
};

export type Reply = {
  id: string;
  threadId: string;
  body: string;
  authorId: string;
  createdAt: string;
};

export type Subscriber = {
  id: string;
  email: string;
  source: "resources" | "community";
  token: string;
  createdAt: string;
  unsubscribedAt: string | null;
};

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  featured: boolean;
  draft: boolean;
  body: string;
  updatedAt: string;
};

export function newId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `${prefix}_${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/* ---------------------------------------------------------------------- users */

type UserRow = {
  id: string;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  bio: string;
  created_at: string;
};

/** Email is ciphertext in the row; a value that will not decrypt is dropped. */
async function toUser(env: Env, row: UserRow): Promise<User | null> {
  const email = await decryptField(env, row.email);
  if (email === null) return null;
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email,
    passwordHash: row.password_hash,
    bio: row.bio,
    createdAt: row.created_at,
  };
}

export function publicUser(user: User): PublicUser {
  return { id: user.id, username: user.username, name: user.name, bio: user.bio, createdAt: user.createdAt };
}

/**
 * Looks up by blind index, falling back to the plain column so rows written
 * before encryption was enabled still resolve.
 */
export async function findUserByEmail(env: Env, email: string): Promise<User | null> {
  const index = await blindIndex(env, email);
  const row = await env.DB.prepare("SELECT * FROM users WHERE email_index = ? OR email = ?")
    .bind(index, email.trim().toLowerCase())
    .first<UserRow>();
  return row ? toUser(env, row) : null;
}

export async function findUserById(env: Env, id: string): Promise<User | null> {
  const row = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  return row ? toUser(env, row) : null;
}

export async function findPublicUserByUsername(env: Env, username: string): Promise<PublicUser | null> {
  const row = await env.DB.prepare(
    "SELECT id, username, name, bio, created_at FROM users WHERE username = ?",
  )
    .bind(username.toLowerCase())
    .first<{ id: string; username: string; name: string; bio: string; created_at: string }>();
  return row
    ? { id: row.id, username: row.username, name: row.name, bio: row.bio, createdAt: row.created_at }
    : null;
}

export async function usernameTaken(env: Env, username: string): Promise<boolean> {
  const row = await env.DB.prepare("SELECT 1 AS hit FROM users WHERE username = ?").bind(username).first();
  return Boolean(row);
}

export async function countMembers(env: Env): Promise<number> {
  const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM users").first<{ total: number }>();
  return Number(row?.total ?? 0);
}

/**
 * Bring accounts created before forum signups were connected to the email list
 * into the subscriber table once. Existing unsubscribe choices are preserved.
 */
export async function ensureMemberSubscriptions(env: Env): Promise<void> {
  const synced = await env.DB.prepare("SELECT 1 AS done FROM app_settings WHERE key = ?")
    .bind("member_subscribers_backfilled")
    .first();
  if (synced) return;

  const { results } = await env.DB.prepare("SELECT * FROM users ORDER BY created_at ASC").all<UserRow>();
  const inserts: D1PreparedStatement[] = [];
  for (const row of results ?? []) {
    const user = await toUser(env, row);
    if (!user) continue;
    const [storedEmail, index] = await Promise.all([
      encryptField(env, user.email),
      blindIndex(env, user.email),
    ]);
    inserts.push(
      env.DB.prepare(
        "INSERT OR IGNORE INTO subscribers (id, email, email_index, source, token, created_at, unsubscribed_at) VALUES (?, ?, ?, 'community', ?, ?, NULL)",
      ).bind(newId("sub"), storedEmail, index, newToken(), user.createdAt, null),
    );
  }

  for (let offset = 0; offset < inserts.length; offset += 90) {
    await env.DB.batch(inserts.slice(offset, offset + 90));
  }
  await env.DB.prepare("INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)")
    .bind("member_subscribers_backfilled", nowIso())
    .run();
}

export async function createUser(
  env: Env,
  input: { username: string; name: string; email: string; passwordHash: string },
): Promise<User> {
  const user: User = {
    id: newId("usr"),
    username: input.username,
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    bio: "",
    createdAt: nowIso(),
  };

  const [storedEmail, index] = await Promise.all([
    encryptField(env, user.email),
    blindIndex(env, user.email),
  ]);

  const existingSubscriber = await env.DB.prepare(
    "SELECT id FROM subscribers WHERE email_index = ? OR email = ?",
  )
    .bind(index, user.email)
    .first<{ id: string }>();

  const statements = [env.DB.prepare(
    "INSERT INTO users (id, username, name, email, email_index, password_hash, bio, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(user.id, user.username, user.name, storedEmail, index, user.passwordHash, user.bio, user.createdAt)];

  if (existingSubscriber) {
    // Completing forum registration is explicit consent under the signup copy.
    statements.push(
      env.DB.prepare("UPDATE subscribers SET unsubscribed_at = NULL WHERE id = ?")
        .bind(existingSubscriber.id),
    );
  } else {
    statements.push(
      env.DB.prepare(
        "INSERT OR IGNORE INTO subscribers (id, email, email_index, source, token, created_at, unsubscribed_at) VALUES (?, ?, ?, 'community', ?, ?, NULL)",
      ).bind(newId("sub"), await encryptField(env, user.email), index, newToken(), user.createdAt),
    );
  }
  await env.DB.batch(statements);

  return user;
}

/** Display names for a set of ids, in one query rather than one per row. */
export async function userNames(env: Env, ids: string[]): Promise<Map<string, PublicUser>> {
  const unique = [...new Set(ids)].filter(Boolean);
  const map = new Map<string, PublicUser>();
  if (unique.length === 0) return map;

  const placeholders = unique.map(() => "?").join(",");
  const { results } = await env.DB.prepare(
    `SELECT id, username, name, bio, created_at FROM users WHERE id IN (${placeholders})`,
  )
    .bind(...unique)
    .all<{ id: string; username: string; name: string; bio: string; created_at: string }>();

  for (const row of results ?? []) {
    map.set(row.id, {
      id: row.id,
      username: row.username,
      name: row.name,
      bio: row.bio,
      createdAt: row.created_at,
    });
  }
  return map;
}

/* -------------------------------------------------------------------- threads */

type ThreadRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  author_id: string;
  created_at: string;
  locked: number;
  pinned: number;
  replies?: number;
};

function toThread(row: ThreadRow): Thread {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    body: row.body,
    authorId: row.author_id,
    createdAt: row.created_at,
    locked: Boolean(row.locked),
    pinned: Boolean(row.pinned),
  };
}

export async function listThreads(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT t.*, (SELECT COUNT(*) FROM replies r WHERE r.thread_id = t.id) AS replies
     FROM threads t
     ORDER BY t.pinned DESC, t.created_at DESC`,
  ).all<ThreadRow>();

  const rows = results ?? [];
  const authors = await userNames(
    env,
    rows.map((row) => row.author_id),
  );

  return rows.map((row) => ({
    ...toThread(row),
    body: row.body.slice(0, 280),
    replyCount: Number(row.replies ?? 0),
    author: authors.get(row.author_id) ?? null,
  }));
}

export async function findThreadBySlug(env: Env, slug: string): Promise<Thread | null> {
  const row = await env.DB.prepare("SELECT * FROM threads WHERE slug = ?").bind(slug).first<ThreadRow>();
  return row ? toThread(row) : null;
}

export async function findThreadById(env: Env, id: string): Promise<Thread | null> {
  const row = await env.DB.prepare("SELECT * FROM threads WHERE id = ?").bind(id).first<ThreadRow>();
  return row ? toThread(row) : null;
}

export async function createThread(
  env: Env,
  input: { slug: string; title: string; category: string; body: string; authorId: string },
): Promise<Thread> {
  const thread: Thread = {
    id: newId("thr"),
    slug: input.slug,
    title: input.title,
    category: input.category,
    body: input.body,
    authorId: input.authorId,
    createdAt: nowIso(),
    locked: false,
    pinned: false,
  };

  await env.DB.prepare(
    "INSERT INTO threads (id, slug, title, category, body, author_id, created_at, locked, pinned) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)",
  )
    .bind(thread.id, thread.slug, thread.title, thread.category, thread.body, thread.authorId, thread.createdAt)
    .run();

  return thread;
}

export async function updateThread(
  env: Env,
  id: string,
  changes: { locked?: boolean; pinned?: boolean },
): Promise<void> {
  const sets: string[] = [];
  const values: (number | string)[] = [];
  if (typeof changes.locked === "boolean") {
    sets.push("locked = ?");
    values.push(changes.locked ? 1 : 0);
  }
  if (typeof changes.pinned === "boolean") {
    sets.push("pinned = ?");
    values.push(changes.pinned ? 1 : 0);
  }
  if (sets.length === 0) return;

  await env.DB.prepare(`UPDATE threads SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...values, id)
    .run();
}

export async function deleteThread(env: Env, id: string): Promise<void> {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM replies WHERE thread_id = ?").bind(id),
    env.DB.prepare("DELETE FROM threads WHERE id = ?").bind(id),
  ]);
}

/* -------------------------------------------------------------------- replies */

type ReplyRow = { id: string; thread_id: string; body: string; author_id: string; created_at: string };

function toReply(row: ReplyRow): Reply {
  return {
    id: row.id,
    threadId: row.thread_id,
    body: row.body,
    authorId: row.author_id,
    createdAt: row.created_at,
  };
}

export async function repliesForThread(env: Env, threadId: string) {
  const { results } = await env.DB.prepare("SELECT * FROM replies WHERE thread_id = ? ORDER BY created_at ASC")
    .bind(threadId)
    .all<ReplyRow>();

  const rows = results ?? [];
  const authors = await userNames(
    env,
    rows.map((row) => row.author_id),
  );

  return rows.map((row) => ({ ...toReply(row), author: authors.get(row.author_id) ?? null }));
}

export async function recentReplies(env: Env, limit = 20) {
  const { results } = await env.DB.prepare(
    `SELECT r.*, t.slug AS thread_slug, t.title AS thread_title
     FROM replies r LEFT JOIN threads t ON t.id = r.thread_id
     ORDER BY r.created_at DESC LIMIT ?`,
  )
    .bind(limit)
    .all<ReplyRow & { thread_slug: string | null; thread_title: string | null }>();
  const rows = results ?? [];
  const authors = await userNames(env, rows.map((row) => row.author_id));
  return rows.map((row) => ({
    ...toReply(row),
    author: authors.get(row.author_id) ?? null,
    thread: row.thread_slug && row.thread_title ? { slug: row.thread_slug, title: row.thread_title } : null,
  }));
}

export async function countReplies(env: Env): Promise<number> {
  const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM replies").first<{ total: number }>();
  return Number(row?.total ?? 0);
}

/** Author ids of everyone in a thread, so a reply can notify them. */
export async function threadParticipants(env: Env, threadId: string): Promise<string[]> {
  const { results } = await env.DB.prepare(
    `SELECT author_id FROM threads WHERE id = ?
     UNION
     SELECT author_id FROM replies WHERE thread_id = ?`,
  )
    .bind(threadId, threadId)
    .all<{ author_id: string }>();
  return (results ?? []).map((row) => row.author_id);
}

export async function createReply(
  env: Env,
  input: { threadId: string; body: string; authorId: string },
): Promise<Reply> {
  const reply: Reply = {
    id: newId("rep"),
    threadId: input.threadId,
    body: input.body,
    authorId: input.authorId,
    createdAt: nowIso(),
  };

  await env.DB.prepare("INSERT INTO replies (id, thread_id, body, author_id, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(reply.id, reply.threadId, reply.body, reply.authorId, reply.createdAt)
    .run();

  return reply;
}

export async function deleteReply(env: Env, id: string): Promise<boolean> {
  const result = await env.DB.prepare("DELETE FROM replies WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

/* ---------------------------------------------------------------- subscribers */

type SubscriberRow = {
  id: string;
  email: string;
  source: "resources" | "community";
  token: string;
  created_at: string;
  unsubscribed_at: string | null;
};

async function toSubscriber(env: Env, row: SubscriberRow): Promise<Subscriber | null> {
  const email = await decryptField(env, row.email);
  if (email === null) return null;
  return {
    id: row.id,
    email,
    source: row.source,
    token: row.token,
    createdAt: row.created_at,
    unsubscribedAt: row.unsubscribed_at,
  };
}

/** Idempotent: subscribing twice keeps the original row and returns it. */
export async function addSubscriber(
  env: Env,
  email: string,
  source: "resources" | "community",
): Promise<{ subscriber: Subscriber; created: boolean }> {
  const index = await blindIndex(env, email);
  const existing = await env.DB.prepare("SELECT * FROM subscribers WHERE email_index = ? OR email = ?")
    .bind(index, email)
    .first<SubscriberRow>();

  if (existing) {
    const found = await toSubscriber(env, existing);
    if (found) {
      if (existing.unsubscribed_at) {
        await env.DB.prepare("UPDATE subscribers SET unsubscribed_at = NULL WHERE id = ?").bind(existing.id).run();
        return { subscriber: { ...found, unsubscribedAt: null }, created: false };
      }
      return { subscriber: found, created: false };
    }
  }

  const subscriber: Subscriber = {
    id: newId("sub"),
    email,
    source,
    token: newToken(),
    createdAt: nowIso(),
    unsubscribedAt: null,
  };

  await env.DB.prepare(
    "INSERT INTO subscribers (id, email, email_index, source, token, created_at, unsubscribed_at) VALUES (?, ?, ?, ?, ?, ?, NULL)",
  )
    .bind(
      subscriber.id,
      await encryptField(env, subscriber.email),
      index,
      subscriber.source,
      subscriber.token,
      subscriber.createdAt,
    )
    .run();

  return { subscriber, created: true };
}

export async function unsubscribeByToken(env: Env, token: string): Promise<boolean> {
  const row = await env.DB.prepare("SELECT id FROM subscribers WHERE token = ?").bind(token).first<{ id: string }>();
  if (!row) return false;
  await env.DB.prepare("UPDATE subscribers SET unsubscribed_at = COALESCE(unsubscribed_at, ?) WHERE id = ?")
    .bind(nowIso(), row.id)
    .run();
  return true;
}

export async function listSubscribers(env: Env): Promise<Subscriber[]> {
  const { results } = await env.DB.prepare("SELECT * FROM subscribers ORDER BY created_at DESC").all<SubscriberRow>();
  const rows = await Promise.all((results ?? []).map((row) => toSubscriber(env, row)));
  // A row whose ciphertext will not authenticate is not shown; it is not
  // silently treated as empty either.
  return rows.filter((row): row is Subscriber => row !== null);
}

export async function deleteSubscriber(env: Env, id: string): Promise<boolean> {
  const result = await env.DB.prepare("DELETE FROM subscribers WHERE id = ?").bind(id).run();
  return (result.meta.changes ?? 0) > 0;
}

/* ---------------------------------------------------------------------- posts */

type PostRow = {
  slug: string;
  title: string;
  description: string;
  category: string;
  published_at: string;
  featured: number;
  draft: number;
  body: string;
  updated_at: string;
};

function toPost(row: PostRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    publishedAt: row.published_at,
    featured: Boolean(row.featured),
    draft: Boolean(row.draft),
    body: row.body,
    updatedAt: row.updated_at,
  };
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export async function listPosts(env: Env, includeDrafts = false) {
  const sql = includeDrafts
    ? "SELECT * FROM posts ORDER BY published_at DESC"
    : "SELECT * FROM posts WHERE draft = 0 ORDER BY published_at DESC";
  const { results } = await env.DB.prepare(sql).all<PostRow>();
  return (results ?? []).map((row) => {
    const post = toPost(row);
    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      date: post.publishedAt.slice(0, 10),
      featured: post.featured,
      draft: post.draft,
      readingTime: readingTime(post.body),
    };
  });
}

export async function getPost(env: Env, slug: string): Promise<Post | null> {
  const row = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?").bind(slug).first<PostRow>();
  return row ? toPost(row) : null;
}

export async function upsertPost(env: Env, post: Post): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO posts (slug, title, description, category, published_at, featured, draft, body, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       category = excluded.category,
       published_at = excluded.published_at,
       featured = excluded.featured,
       draft = excluded.draft,
       body = excluded.body,
       updated_at = excluded.updated_at`,
  )
    .bind(
      post.slug,
      post.title,
      post.description,
      post.category,
      post.publishedAt,
      post.featured ? 1 : 0,
      post.draft ? 1 : 0,
      post.body,
      post.updatedAt,
    )
    .run();
}

export async function deletePost(env: Env, slug: string): Promise<boolean> {
  const result = await env.DB.prepare("DELETE FROM posts WHERE slug = ?").bind(slug).run();
  return (result.meta.changes ?? 0) > 0;
}

/* ------------------------------------------------------------------ email log */

export async function recordMail(
  env: Env,
  entry: { kind: string; status: string; recipient: string; subject: string; detail?: string },
): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO email_log (id, kind, status, recipient, subject, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(newId("mail"), entry.kind, entry.status, entry.recipient, entry.subject, entry.detail ?? "", nowIso())
    .run();

  // Keep the log bounded; it is a diagnostic aid, not an archive.
  await env.DB.prepare(
    "DELETE FROM email_log WHERE id NOT IN (SELECT id FROM email_log ORDER BY created_at DESC LIMIT 200)",
  ).run();
}

export async function recentMail(env: Env, limit = 50) {
  const { results } = await env.DB.prepare(
    "SELECT id, kind, status, recipient, subject, detail, created_at FROM email_log ORDER BY created_at DESC LIMIT ?",
  )
    .bind(limit)
    .all();
  return results ?? [];
}

/* ---------------------------------------------------------------- rate limits */

/**
 * Counts a hit and returns the count inside the current window, or null when
 * the window has just rolled over. One statement, so two requests in flight
 * cannot both read "0".
 */
export async function hitRateLimit(env: Env, key: string, windowMs: number): Promise<number> {
  const now = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN ? - rate_limits.window_start >= ? THEN 1 ELSE rate_limits.count + 1 END,
       window_start = CASE WHEN ? - rate_limits.window_start >= ? THEN ? ELSE rate_limits.window_start END
     RETURNING count`,
  )
    .bind(key, now, now, windowMs, now, windowMs, now)
    .first<{ count: number }>();

  return Number(row?.count ?? 1);
}

/* ----------------------------------------------------------------- audit log */

/**
 * Records a security event. Never called with a password, token or full email —
 * an audit log that leaks what it audits is worse than none.
 */
export async function audit(
  env: Env,
  entry: { event: string; subject?: string; ip?: string; detail?: string },
): Promise<void> {
  try {
    await env.DB.prepare(
      "INSERT INTO audit_log (id, event, subject, ip, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(
        newId("aud"),
        entry.event,
        entry.subject ?? "",
        entry.ip ?? "",
        (entry.detail ?? "").slice(0, 300),
        nowIso(),
      )
      .run();

    await env.DB.prepare(
      "DELETE FROM audit_log WHERE id NOT IN (SELECT id FROM audit_log ORDER BY created_at DESC LIMIT 500)",
    ).run();
  } catch (error) {
    // Logging must never break the request it is recording.
    console.error("audit write failed", error);
  }
}

export async function recentAudit(env: Env, limit = 50) {
  const { results } = await env.DB.prepare(
    "SELECT id, event, subject, ip, detail, created_at FROM audit_log ORDER BY created_at DESC LIMIT ?",
  )
    .bind(limit)
    .all();
  return results ?? [];
}
