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
import { communityJson } from "@/lib/community-cloudflare";

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

function listDiscussionsFromStore(): Discussion[] {
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

function getDiscussionFromStore(slug: string): Discussion | null {
  const store = requestStore();
  const thread = findThreadBySlug(store, slug);
  if (!thread) return null;
  return toDiscussion(store, thread, repliesForThread(store, thread.id).length);
}

function categoryCountFromStore(slug: string) {
  const store = requestStore();
  return store.threads.filter((thread) => thread.category === slug).length;
}

function totalThreadCountFromStore() {
  return requestStore().threads.length;
}

function getUserFromStore(username: string): CommunityProfile | null {
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
function getThreadViewFromStore(slug: string): ThreadView | null {
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

type ApiAuthor = { id: string; username: string; name: string; bio: string; createdAt: string } | null;
type ApiThread = {
  id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  authorId: string;
  createdAt: string;
  locked: boolean;
  pinned: boolean;
  replyCount?: number;
  replies?: Array<{ id: string; threadId: string; body: string; authorId: string; createdAt: string; author: ApiAuthor }>;
  author: ApiAuthor;
};

function apiProfile(user: NonNullable<ApiAuthor>): CommunityProfile {
  return {
    username: user.username,
    displayName: user.name,
    bio: user.bio || "Member of the Prismelo community. Reading and posting in the technical discussions.",
    role: "Community member",
    joinedAt: user.createdAt,
  };
}

function apiDiscussion(thread: ApiThread): Discussion {
  const flat = thread.body.replace(/\s+/g, " ").trim();
  return {
    slug: thread.slug,
    title: thread.title,
    category: thread.category,
    author: thread.author?.username ?? "deleted",
    authorName: thread.author?.name ?? "Deleted member",
    excerpt: flat.length > 220 ? `${flat.slice(0, 220).trimEnd()}…` : flat,
    body: paragraphs(thread.body),
    createdAt: thread.createdAt,
    replies: thread.replyCount ?? thread.replies?.length ?? 0,
    pinned: thread.pinned,
    locked: thread.locked,
  };
}

export async function listDiscussions(): Promise<Discussion[]> {
  const data = await communityJson<{ threads: ApiThread[] }>("/api/community/threads");
  return data ? data.threads.map(apiDiscussion) : listDiscussionsFromStore();
}

export async function getDiscussion(slug: string): Promise<Discussion | null> {
  const data = await communityJson<{ thread: ApiThread }>(`/api/community/threads/${encodeURIComponent(slug)}`);
  return data ? apiDiscussion(data.thread) : getDiscussionFromStore(slug);
}

export async function discussionsByCategory(category: string) {
  return (await listDiscussions()).filter((discussion) => discussion.category === category);
}

export async function discussionsByAuthor(username: string) {
  return (await listDiscussions()).filter(
    (discussion) => discussion.author.toLowerCase() === username.toLowerCase(),
  );
}

export async function categoryCount(slug: string) {
  const data = await communityJson<{ threads: ApiThread[] }>("/api/community/threads");
  return data ? data.threads.filter((thread) => thread.category === slug).length : categoryCountFromStore(slug);
}

export async function totalThreadCount() {
  const data = await communityJson<{ threads: ApiThread[] }>("/api/community/threads");
  return data ? data.threads.length : totalThreadCountFromStore();
}

export async function getUser(username: string): Promise<CommunityProfile | null> {
  const data = await communityJson<{ user: NonNullable<ApiAuthor> }>(`/api/community/users/${encodeURIComponent(username)}`);
  return data ? apiProfile(data.user) : getUserFromStore(username);
}

export async function getThreadView(slug: string): Promise<ThreadView | null> {
  const data = await communityJson<{ thread: ApiThread }>(`/api/community/threads/${encodeURIComponent(slug)}`);
  if (!data) return getThreadViewFromStore(slug);

  const thread = data.thread;
  return {
    thread: {
      id: thread.id,
      slug: thread.slug,
      title: thread.title,
      category: thread.category,
      body: thread.body,
      authorId: thread.authorId,
      createdAt: thread.createdAt,
      locked: thread.locked,
      pinned: thread.pinned,
    },
    author: thread.author ? apiProfile(thread.author) : deletedProfile(),
    replies: (thread.replies ?? []).map((reply) => ({
      id: reply.id,
      body: paragraphs(reply.body),
      author: reply.author ? apiProfile(reply.author) : deletedProfile(),
      createdAt: reply.createdAt,
    })),
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
