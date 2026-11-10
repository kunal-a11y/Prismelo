import { NextResponse, after } from "next/server";
import { currentCommunityUser } from "@/lib/community-auth";
import {
  findThreadBySlug,
  newId,
  readStore,
  updateStore,
} from "@/lib/community-store";
import { notifyReply } from "@/lib/notify";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await currentCommunityUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to reply." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { slug } = await params;
  const store = readStore();
  const thread = findThreadBySlug(store, slug);
  if (!thread) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }
  if (thread.locked) {
    return NextResponse.json(
      { error: "This discussion is locked. Start a new one instead." },
      { status: 409 },
    );
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const payload = parsed.data;

  const body = String(payload.body ?? "").trim();
  if (body.length < 2 || body.length > 4000) {
    return NextResponse.json(
      { error: "Write between 2 and 4000 characters.", fields: { body: "Write a reply first." } },
      { status: 400 },
    );
  }

  updateStore((current) => {
    current.replies.push({
      id: newId("reply"),
      threadId: thread.id,
      body,
      authorId: user.id,
      createdAt: new Date().toISOString(),
    });
  });

  const origin = new URL(request.url).origin;
  after(async () => {
    await notifyReply({ thread, body, author: user, origin });
  });

  return NextResponse.json({ ok: true });
}
