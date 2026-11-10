import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { notifyNewResource } from "@/lib/notify";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";
import {
  type PostInput,
  saveAdminPost,
  slugify,
  validatePost,
} from "@/lib/admin-posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badRequest(message: string, fields?: Record<string, string>) {
  return NextResponse.json({ error: message, fields }, { status: 400 });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const parsed = await readJsonBody(request, 256 * 1024);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const payload = parsed.data;

  const title = String(payload.title ?? "").trim();
  const input: PostInput = {
    title,
    slug: String(payload.slug ?? "").trim() || slugify(title),
    description: String(payload.description ?? "").trim(),
    category: String(payload.category ?? "Engineering"),
    date: String(payload.date ?? ""),
    featured: Boolean(payload.featured),
    draft: Boolean(payload.draft),
    body: String(payload.body ?? ""),
  };

  const errors = validatePost(input);
  if (Object.keys(errors).length > 0) {
    return badRequest("Check the highlighted fields.", errors);
  }

  try {
    const post = saveAdminPost(input);
    revalidatePath("/resources");
    revalidatePath(`/resources/${post.slug}`);
    revalidatePath("/sitemap.xml");

    if (!post.draft) {
      const origin = new URL(request.url).origin;
      after(async () => {
        await notifyNewResource(post, origin);
      });
    }

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const fields = (error as { fields?: Record<string, string> }).fields;
    return NextResponse.json(
      { error: fields?.slug ?? "Could not save the post.", fields },
      { status: fields ? 409 : 500 },
    );
  }
}
