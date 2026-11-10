import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { readStore, updateStore } from "@/lib/community-store";
import { isSameOriginRequest } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { id } = await params;
  const store = readStore();
  const reply = store.replies.find((entry) => entry.id === id);
  if (!reply) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }

  const thread = store.threads.find((entry) => entry.id === reply.threadId);

  updateStore((current) => {
    current.replies = current.replies.filter((entry) => entry.id !== id);
  });

  revalidatePath("/community");
  if (thread) revalidatePath(`/community/t/${thread.slug}`);
  return NextResponse.json({ ok: true });
}
