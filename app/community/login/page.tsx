import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, Eyebrow } from "@/components/section";
import { CommunityAuthForm } from "@/components/community/auth-form";
import { currentCommunityUser } from "@/lib/community-auth";

export const metadata: Metadata = {
  title: "Community sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CommunityLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await currentCommunityUser()) redirect("/community");
  const { next } = await searchParams;

  return (
    <Container className="flex min-h-[80vh] items-center justify-center pt-28 pb-16 md:pt-32 md:pb-20">
      <div className="w-full max-w-md text-center">
        <Eyebrow tone="violet" className="justify-center">
          Community
        </Eyebrow>
        <h1 className="t-h2 mt-5 text-white">Sign in</h1>
        <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
          Sign in to start discussions and reply to threads. Reading is open without an
          account.
        </p>
        <CommunityAuthForm mode="login" next={next} />
      </div>
    </Container>
  );
}
