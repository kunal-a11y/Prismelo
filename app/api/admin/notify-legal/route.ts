import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { emailConfigured } from "@/lib/email";
import { LEGAL_PAGES, recordLegalHash } from "@/lib/legal";
import { notifyLegalUpdate } from "@/lib/notify";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends a reviewed policy-change notice to the email list, or records the
 * current version without emailing anybody. Nothing is sent automatically when
 * a policy file changes: a change is only "announced" after an admin confirms.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const parsed = await readJsonBody<{ key?: unknown; mode?: unknown; note?: unknown }>(
    request,
    4 * 1024,
  );
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const key = String(parsed.data.key ?? "");
  const mode = parsed.data.mode === "record" ? "record" : "notify";
  const note = typeof parsed.data.note === "string" ? parsed.data.note.trim().slice(0, 300) : "";

  const page = LEGAL_PAGES.find((entry) => entry.key === key);
  if (!page) {
    return NextResponse.json({ error: "Unknown policy." }, { status: 400 });
  }

  if (mode === "record") {
    recordLegalHash(page.key);
    revalidatePath("/admin/notifications");
    return NextResponse.json({ ok: true, recorded: true, sent: 0 });
  }

  if (!emailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email delivery is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS and EMAIL_FROM, restart, then send the notice.",
      },
      { status: 503 },
    );
  }

  const origin = new URL(request.url).origin;
  const result = await notifyLegalUpdate(
    { label: page.label, path: page.path, note },
    origin,
  );

  // Only record the hash once the notice actually went out.
  recordLegalHash(page.key);
  revalidatePath("/admin/notifications");

  return NextResponse.json({ ok: true, sent: result.recipients });
}
