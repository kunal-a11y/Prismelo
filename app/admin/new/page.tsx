import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container, Eyebrow } from "@/components/section";
import { PostForm } from "@/components/admin/post-form";
import { isAdmin } from "@/lib/admin-auth";
import { today } from "@/lib/admin-posts";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin/login");

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
        <Eyebrow tone="violet">New</Eyebrow>
        <h1 className="t-h2 mt-4 text-white">Write a resource</h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          Save it as a draft to keep working, or untick the draft box to publish it
          immediately.
        </p>
      </div>

      <PostForm
        mode="create"
        initial={{
          slug: "",
          title: "",
          description: "",
          category: "Engineering",
          date: today(),
          featured: false,
          draft: true,
          body: "",
        }}
      />
    </Container>
  );
}
