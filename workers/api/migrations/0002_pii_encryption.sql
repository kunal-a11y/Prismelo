-- Personal data at rest.
--
-- `email` becomes AES-256-GCM ciphertext, which is different bytes every time,
-- so it can no longer be compared or made unique. `email_index` holds an
-- HMAC-SHA256 blind index instead: deterministic enough to look up and to be
-- uniquely constrained, useless without DATA_KEY.

ALTER TABLE users ADD COLUMN email_index TEXT;
ALTER TABLE subscribers ADD COLUMN email_index TEXT;

CREATE INDEX IF NOT EXISTS users_email_index_idx ON users (email_index);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_index_idx ON subscribers (email_index);

-- Security events worth being able to answer questions about later: who signed
-- in, from where, and who failed. No passwords or tokens are recorded.
CREATE TABLE IF NOT EXISTS audit_log (
  id         TEXT PRIMARY KEY,
  event      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  ip         TEXT NOT NULL DEFAULT '',
  detail     TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_recent_idx ON audit_log (created_at DESC);
