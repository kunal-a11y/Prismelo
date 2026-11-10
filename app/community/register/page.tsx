import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, Eyebrow } from "@/components/section";
import { CommunityAuthForm } from "@/components/community/auth-form";
import { communityAuthConfigured, currentCommunityUser } from "@/lib/community-auth";

export const metadata: Metadata = {
  title: "Create a community account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CommunityRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await currentCommunityUser()) redirect("/community");
  const { next } = await searchParams;
  const configured = communityAuthConfigured();

  return (
    <Container className="flex min-h-[80vh] items-center justify-center pt-28 pb-16 md:pt-32 md:pb-20">
      <div className="w-full max-w-md text-center">
        <Eyebrow tone="violet" className="justify-center">
          Community
        </Eyebrow>
        <h1 className="t-h2 mt-5 text-white">Create an account</h1>
        <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
          One account for starting discussions and replying. No profile picture, no feed —
          just the threads.
        </p>

        {configured ? (
          <CommunityAuthForm mode="register" next={next} />
        ) : (
          <div className="mt-8 border border-dashed border-[#3a3a3a] p-6 text-left">
            <h2 className="text-[15px] text-white">Accounts are disabled on this server</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              The community needs a signing secret before it can create accounts. Set{" "}
              <code className="text-muted">COMMUNITY_SESSION_SECRET</code> (or keep{" "}
              <code className="text-muted">ADMIN_PASSWORD</code> set) in{" "}
              <code className="text-muted">.env.local</code> and restart the server.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
