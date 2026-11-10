import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Community data lives in a single JSON file on the server's disk, next to the
 * post files in content/resources. That keeps the forum working on the same
 * self-hosted Node host as the rest of the site — no external database and no
 * account with a third party.
 *
 * Writes go to a temporary file and are renamed into place, so a crash mid-write
 * cannot leave a half-written forum behind. The file holds personal data (email
 * addresses, password hashes), so it is gitignored and must not be served.
 */

export const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "community.json");

export type StoredUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  bio: string;
  createdAt: string;
};

export type StoredThread = {
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

export type StoredReply = {
  id: string;
  threadId: string;
  body: string;
  authorId: string;
  createdAt: string;
};

export type SubscriberSource = "resources" | "community";

export type StoredSubscriber = {
  id: string;
  email: string;
  source: SubscriberSource;
  token: string;
  createdAt: string;
  unsubscribedAt: string | null;
};

export type CommunityStore = {
  users: StoredUser[];
  threads: StoredThread[];
  replies: StoredReply[];
  subscribers: StoredSubscriber[];
};

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function emptyStore(): CommunityStore {
  return { users: [], threads: [], replies: [], subscribers: [] };
}

export function readStore(): CommunityStore {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<CommunityStore>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      replies: Array.isArray(parsed.replies) ? parsed.replies : [],
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
    };
  } catch {
    // Missing or unreadable file: start from an empty forum rather than
    // crashing every community page.
    return emptyStore();
  }
}

export function writeStore(store: CommunityStore) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporary = `${STORE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, STORE_FILE);
}

/** Reads, mutates and writes the store in one step. */
export function updateStore<T>(mutate: (store: CommunityStore) => T): T {
  const store = readStore();
  const result = mutate(store);
  writeStore(store);
  return result;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function findUserById(store: CommunityStore, id: string) {
  return store.users.find((user) => user.id === id) ?? null;
}

export function findUserByUsername(store: CommunityStore, username: string) {
  return (
    store.users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    ) ?? null
  );
}

export function findUserByEmail(store: CommunityStore, email: string) {
  const normalized = normalizeEmail(email);
  return store.users.find((user) => user.email === normalized) ?? null;
}

export function findThreadBySlug(store: CommunityStore, slug: string) {
  return store.threads.find((thread) => thread.slug === slug) ?? null;
}

export function repliesForThread(store: CommunityStore, threadId: string) {
  return store.replies
    .filter((reply) => reply.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function activeSubscribers(store: CommunityStore) {
  return store.subscribers.filter((subscriber) => !subscriber.unsubscribedAt);
}

export function newSubscriberToken() {
  return crypto.randomBytes(24).toString("base64url");
}
