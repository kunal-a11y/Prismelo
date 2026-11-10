import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/community-store";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Unsubscribes by token. The token is the authorisation — no session needed. */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const parsed = await readJsonBody(request, 2 * 1024);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const token = String(parsed.data.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "Missing unsubscribe token." }, { status: 400 });
  }

  const subscriber = readStore().subscribers.find((entry) => entry.token === token);
  if (!subscriber) {
    return NextResponse.json({ error: "That link is not valid." }, { status: 404 });
  }

  if (!subscriber.unsubscribedAt) {
    updateStore((store) => {
      const found = store.subscribers.find((entry) => entry.token === token);
      if (found) found.unsubscribedAt = new Date().toISOString();
    });
  }

  return NextResponse.json({ ok: true, email: subscriber.email });
}
