import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { notifyNewResource } from "@/lib/notify";
import { isSameOriginRequest, readJsonBody } from "@/lib/request";
import {
  type PostInput,
  deleteAdminPost,
  findAdminPost,
  saveAdminPost,
} from "@/lib/admin-posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { slug } = await params;
  const existing = findAdminPost(slug);
  if (!existing) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const parsed = await readJsonBody(request, 256 * 1024);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const payload = parsed.data;

  // The URL stays fixed once a post exists so published links never break.
  const input: PostInput = {
    slug: existing.slug,
    title: payload.title === undefined ? existing.title : String(payload.title).trim(),
    description:
      payload.description === undefined ? existing.description : String(payload.description).trim(),
    category: payload.category === undefined ? existing.category : String(payload.category),
    date: payload.date === undefined ? existing.date : String(payload.date),
    featured: payload.featured === undefined ? existing.featured : Boolean(payload.featured),
    draft: payload.draft === undefined ? existing.draft : Boolean(payload.draft),
    body: payload.body === undefined ? existing.body : String(payload.body),
  };

  try {
    const post = saveAdminPost(input, { slug: existing.slug, draft: existing.draft });
    revalidatePath("/resources");
    revalidatePath(`/resources/${post.slug}`);
    revalidatePath("/sitemap.xml");

    // Only a draft becoming live is news; editing a live post is not.
    if (existing.draft && !post.draft) {
      const origin = new URL(request.url).origin;
      after(async () => {
        await notifyNewResource(post, origin);
      });
    }

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    const fields = (error as { fields?: Record<string, string> }).fields;
    return NextResponse.json(
      { error: fields ? "Check the highlighted fields." : "Could not save the post.", fields },
      { status: fields ? 400 : 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { slug } = await params;
  if (!deleteAdminPost(slug)) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  revalidatePath("/resources");
  revalidatePath(`/resources/${slug}`);
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
