import { cache } from "react";
import {
  findThreadBySlug,
  findUserById,
  findUserByUsername,
  readStore,
  repliesForThread,
  type StoredThread,
  type StoredUser,
} from "@/lib/community-store";
import type { CommunityProfile, Discussion } from "@/lib/community";

/**
 * One data-file read per request, shared by every helper on the page.
 * A community page calls several of these helpers; without the cache each one
 * re-read and re-parsed the whole store.
 */
const requestStore = cache(readStore);

/**
 * Read helpers for the community pages. Server-only: they touch the data file,
 * so they must never be imported by a client component.
 */

function paragraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

type Store = ReturnType<typeof readStore>;

function toDiscussion(
  store: Store,
  thread: StoredThread,
  replyCount: number,
): Discussion {
  const author = findUserById(store, thread.authorId);
  const flat = thread.body.replace(/\s+/g, " ").trim();

  return {
    slug: thread.slug,
    title: thread.title,
    category: thread.category,
    author: author?.username ?? "deleted",
    authorName: author?.name ?? "Deleted member",
    excerpt: flat.length > 220 ? `${flat.slice(0, 220).trimEnd()}…` : flat,
    body: paragraphs(thread.body),
    createdAt: thread.createdAt,
    replies: replyCount,
    pinned: thread.pinned,
    locked: thread.locked,
  };
}

export function listDiscussions(): Discussion[] {
  const store = requestStore();
  const counts = new Map<string, number>();
  for (const reply of store.replies) {
    counts.set(reply.threadId, (counts.get(reply.threadId) ?? 0) + 1);
  }

  return store.threads
    .map((thread) => toDiscussion(store, thread, counts.get(thread.id) ?? 0))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function getDiscussion(slug: string): Discussion | null {
  const store = requestStore();
  const thread = findThreadBySlug(store, slug);
  if (!thread) return null;
  return toDiscussion(store, thread, repliesForThread(store, thread.id).length);
}

export function discussionsByCategory(category: string) {
  return listDiscussions().filter((discussion) => discussion.category === category);
}

export function discussionsByAuthor(username: string) {
  return listDiscussions().filter(
    (discussion) => discussion.author.toLowerCase() === username.toLowerCase(),
  );
}

export function categoryCount(slug: string) {
  const store = requestStore();
  return store.threads.filter((thread) => thread.category === slug).length;
}

export function totalThreadCount() {
  return requestStore().threads.length;
}

export function getUser(username: string): CommunityProfile | null {
  const user = findUserByUsername(requestStore(), username);
  return user ? toProfile(user) : null;
}

export function toProfile(user: StoredUser): CommunityProfile {
  return {
    username: user.username,
    displayName: user.name,
    bio:
      user.bio ||
      "Member of the Prismelo community. Reading and posting in the technical discussions.",
    role: "Community member",
    joinedAt: user.createdAt,
  };
}

export type ThreadView = {
  thread: StoredThread;
  replies: Array<{
    id: string;
    body: string[];
    author: CommunityProfile;
    createdAt: string;
  }>;
  author: CommunityProfile;
};

/** Full thread plus its replies, with authors resolved. */
export function getThreadView(slug: string): ThreadView | null {
  const store = requestStore();
  const thread = findThreadBySlug(store, slug);
  if (!thread) return null;

  const author = findUserById(store, thread.authorId);

  return {
    thread,
    author: author ? toProfile(author) : deletedProfile(),
    replies: repliesForThread(store, thread.id).map((reply) => {
      const user = findUserById(store, reply.authorId);
      return {
        id: reply.id,
        body: paragraphs(reply.body),
        author: user ? toProfile(user) : deletedProfile(),
        createdAt: reply.createdAt,
      };
    }),
  };
}

function deletedProfile(): CommunityProfile {
  return {
    username: "deleted",
    displayName: "Deleted member",
    bio: "",
    role: "Former member",
    joinedAt: new Date(0).toISOString(),
  };
}
