-- Prismelo API schema. One table per thing the site stores; the old JSON file
-- had arrays, D1 has rows, and the shapes match the TypeScript types in src/db.ts.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  bio           TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS threads (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  category   TEXT NOT NULL,
  body       TEXT NOT NULL,
  author_id  TEXT NOT NULL,
  created_at TEXT NOT NULL,
  locked     INTEGER NOT NULL DEFAULT 0,
  pinned     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS replies (
  id         TEXT PRIMARY KEY,
  thread_id  TEXT NOT NULL,
  body       TEXT NOT NULL,
  author_id  TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  source          TEXT NOT NULL,
  token           TEXT NOT NULL UNIQUE,
  created_at      TEXT NOT NULL,
  unsubscribed_at TEXT
);

-- Resources: the .mdx files, stored as markdown text instead of files so the
-- admin area can write them from anywhere.
CREATE TABLE IF NOT EXISTS posts (
  slug         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,
  published_at TEXT NOT NULL,
  featured     INTEGER NOT NULL DEFAULT 0,
  draft        INTEGER NOT NULL DEFAULT 0,
  body         TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_log (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL,
  status     TEXT NOT NULL,
  recipient  TEXT NOT NULL,
  subject    TEXT NOT NULL,
  detail     TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

-- Sliding-window counters. In-memory maps reset with every isolate, which makes
-- them useless for a rate limit that is supposed to survive a cold start.
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count        INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS replies_thread_idx ON replies (thread_id, created_at);
CREATE INDEX IF NOT EXISTS threads_recent_idx ON threads (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (draft, published_at DESC);
