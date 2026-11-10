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
  if (!readStore().subscribers.some((entry) => entry.id === id)) {
    return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
  }

  updateStore((store) => {
    store.subscribers = store.subscribers.filter((entry) => entry.id !== id);
  });

  revalidatePath("/admin/community");
  return NextResponse.json({ ok: true });
}
