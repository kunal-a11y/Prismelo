-- Ciphertext is different for every row, so UNIQUE(email) no longer prevents two
-- accounts sharing an address. The blind index is deterministic, so uniqueness
-- belongs on it. NULLs stay allowed for rows written before encryption existed.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_index_unique ON users (email_index);
