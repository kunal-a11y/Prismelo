import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container, Eyebrow } from "@/components/section";
import { NewThreadForm } from "@/components/community/new-thread-form";
import { currentCommunityUser } from "@/lib/community-auth";
import { getCategory } from "@/lib/community";

export const metadata: Metadata = {
  title: "Start a discussion",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await currentCommunityUser();
  if (!user) {
    redirect(`/community/login?next=${encodeURIComponent("/community/new")}`);
  }

  const { category } = await searchParams;
  const preset = category && getCategory(category) ? category : undefined;

  return (
    <Container className="py-12 md:py-16">
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        All discussions
      </Link>

      <div className="mt-7">
        <Eyebrow tone="violet">New discussion</Eyebrow>
        <h1 className="t-h2 mt-4 text-white">Start a discussion</h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          Posting as <span className="text-white">{user.name}</span> (@{user.username}). Your
          email address stays private; the thread is public.
        </p>
      </div>

      <NewThreadForm defaultCategory={preset} />
    </Container>
  );
}
