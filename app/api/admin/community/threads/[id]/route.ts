import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { readStore, updateStore } from "@/lib/community-store";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { id } = await params;
  const thread = readStore().threads.find((entry) => entry.id === id);
  if (!thread) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  const parsed = await readJsonBody(request, 4 * 1024);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const payload = parsed.data;

  updateStore((store) => {
    const found = store.threads.find((entry) => entry.id === id);
    if (!found) return;
    if (payload.locked !== undefined) found.locked = Boolean(payload.locked);
    if (payload.pinned !== undefined) found.pinned = Boolean(payload.pinned);
  });

  revalidatePath("/community");
  revalidatePath(`/community/t/${thread.slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { id } = await params;
  const thread = readStore().threads.find((entry) => entry.id === id);
  if (!thread) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  updateStore((store) => {
    store.threads = store.threads.filter((entry) => entry.id !== id);
    store.replies = store.replies.filter((reply) => reply.threadId !== id);
  });

  revalidatePath("/community");
  revalidatePath(`/community/t/${thread.slug}`);
  return NextResponse.json({ ok: true });
}
