import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Container, PageHeader, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { DiscussionList } from "@/components/community/discussion-list";
import { SubscribeForm } from "@/components/community/subscribe-form";
import { CommunitySignOutButton } from "@/components/community/sign-out-button";
import { CategoryNav, communityGuidelines } from "@/components/community/ui";
import { listDiscussions } from "@/lib/community-data";
import { currentCommunityUser } from "@/lib/community-auth";

export const metadata: Metadata = {
  title: "Community",
  description:
    "The Prismelo community: technical discussions across development, cybersecurity, AI, cloud and product feedback.",
  alternates: { canonical: "/community" },
};

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const user = await currentCommunityUser();
  const discussions = await listDiscussions();

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="A technical space, built for real questions."
        lead="Discussions across development, security, AI and infrastructure — plus product feedback on the Prismelo group. Reading is open to everyone; posting needs an account."
        aside={
          <div className="flex flex-col items-start gap-4 lg:pt-2">
            {user ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/community/new"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13.5px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Start a discussion
                  </Link>
                  <Link
                    href={`/community/u/${user.username}`}
                    className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[13px] text-white transition-colors hover:border-white/45"
                  >
                    @{user.username}
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[12px] text-faint">Signed in as {user.name}</p>
                  <CommunitySignOutButton />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/community/register"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13.5px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Create account
                  </Link>
                  <Link
                    href="/community/login"
                    className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[13px] text-white transition-colors hover:border-white/45"
                  >
                    Sign in
                  </Link>
                </div>
                <p className="max-w-[34ch] text-[12px] leading-relaxed text-faint">
                  An account is required to post or reply. Registering also subscribes you
                  to email notifications for replies and new articles.
                </p>
              </>
            )}
          </div>
        }
      />

      <Section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              {discussions.length === 0 ? (
                <div className="border border-dashed border-[#242424] px-6 py-16 text-center">
                  <p className="text-[15px] text-white">No discussions yet</p>
                  <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted">
                    This community is live but empty. Start the first thread — a question,
                    a problem you are stuck on, or a note on something you learned.
                  </p>
                  <Link
                    href={user ? "/community/new" : "/community/register"}
                    className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {user ? "Start a discussion" : "Create an account"}
                  </Link>
                </div>
              ) : (
                <Reveal>
                  <DiscussionList items={discussions} />
                </Reveal>
              )}

              <div className="mt-12 border border-line bg-[#050505] p-5 md:p-6">
                <h2 className="text-[15px] text-white">New articles by email</h2>
                <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
                  Get an email when a new resource is published. Community accounts are on
                  this list automatically; this form is for everyone else.
                </p>
                <SubscribeForm className="mt-4" />
              </div>
            </div>

            <aside className="lg:col-span-3 lg:col-start-10">
              <div className="lg:sticky lg:top-24">
                <CategoryNav />

                <div className="mt-9 border-t border-line pt-6">
                  <p className="t-label mb-4 text-faint">Guidelines</p>
                  <ul className="flex flex-col gap-3">
                    {communityGuidelines.map((rule) => (
                      <li
                        key={rule}
                        className="flex gap-2.5 text-[12.5px] leading-relaxed text-muted"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-[1px] w-2.5 shrink-0 bg-[#4a4a4a]"
                        />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-9 border border-line p-4">
                  <p className="t-label text-faint">Report a vulnerability</p>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                    Never post a live security issue here. Use the disclosure route and
                    give us a chance to fix it first.
                  </p>
                  <Link
                    href="/contact"
                    className="u-link mt-3 inline-block text-[12.5px] text-white"
                  >
                    Contact Prismelo
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
