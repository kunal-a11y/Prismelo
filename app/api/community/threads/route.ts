import { NextResponse, after } from "next/server";
import { currentCommunityUser } from "@/lib/community-auth";
import { communityCategories } from "@/lib/community";
import { findUserById, newId, readStore, updateStore } from "@/lib/community-store";
import { notifyThreadCreated } from "@/lib/notify";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uniqueSlug(title: string, taken: Set<string>) {
  const base = slugify(title) || "discussion";
  if (!taken.has(base)) return base;
  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${newId("t").slice(2, 8)}`;
}

export async function POST(request: Request) {
  const user = await currentCommunityUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to start a discussion." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  // Threads can be long, so the cap is generous but still bounded.
  const parsed = await readJsonBody(request, 48 * 1024);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const payload = parsed.data;

  const title = String(payload.title ?? "").trim();
  const category = String(payload.category ?? "");
  const body = String(payload.body ?? "").trim();

  const fields: Record<string, string> = {};
  if (title.length < 6 || title.length > 120) fields.title = "Use a title between 6 and 120 characters.";
  if (!communityCategories.some((entry) => entry.slug === category)) {
    fields.category = "Choose one of the categories.";
  }
  if (body.length < 20 || body.length > 8000) {
    fields.body = "Write between 20 and 8000 characters.";
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields }, { status: 400 });
  }

  const store = readStore();
  const slug = uniqueSlug(title, new Set(store.threads.map((thread) => thread.slug)));
  const createdAt = new Date().toISOString();

  const thread = updateStore((current) => {
    const created = {
      id: newId("thread"),
      slug,
      title,
      category,
      body,
      authorId: user.id,
      createdAt,
      locked: false,
      pinned: false,
    };
    current.threads.push(created);
    return created;
  });

  const author = findUserById(readStore(), user.id) ?? user;
  const origin = new URL(request.url).origin;
  after(async () => {
    await notifyThreadCreated(thread, author, origin);
  });

  return NextResponse.json({ ok: true, slug: thread.slug });
}
