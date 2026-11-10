import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container, Eyebrow } from "@/components/section";
import { PostForm } from "@/components/admin/post-form";
import { isAdmin } from "@/lib/admin-auth";
import { findAdminPost } from "@/lib/admin-posts";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { slug } = await params;
  const { saved } = await searchParams;
  const post = findAdminPost(slug);
  if (!post) notFound();

  return (
    <Container className="py-12 md:py-16">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        All posts
      </Link>

      <div className="mt-7">
        <Eyebrow tone="violet">{post.draft ? "Draft" : "Published"}</Eyebrow>
        <h1 className="t-h2 mt-4 text-white">Edit resource</h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          Changes go live as soon as you save a published post.
        </p>
      </div>

      <PostForm
        mode="edit"
        justSaved={saved === "1"}
        initial={{
          slug: post.slug,
          title: post.title,
          description: post.description,
          category: post.category,
          date: post.date,
          featured: post.featured,
          draft: post.draft,
          body: post.body,
        }}
      />
    </Container>
  );
}
