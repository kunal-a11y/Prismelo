import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Container, Section } from "@/components/section";
import { CommunityAvatar } from "@/components/community/ui";
import { formatCommunityDate } from "@/lib/community";
import { discussionsByAuthor, getUser } from "@/lib/community-data";
import { currentCommunityUser } from "@/lib/community-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = getUser(username);
  if (!user) return { title: "Profile not found" };
  return {
    title: `${user.displayName} (@${user.username})`,
    description: user.bio,
    alternates: { canonical: `/community/u/${user.username}` },
    robots: { index: false, follow: true },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = getUser(username);
  if (!user) notFound();

  const viewer = await currentCommunityUser();
  const threads = discussionsByAuthor(user.username);

  return (
    <>
      <header className="border-b border-line">
        <Container className="pt-28 pb-10 md:pt-32 md:pb-14">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Community
          </Link>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-5">
              <CommunityAvatar name={user.displayName} size="lg" />
              <div>
                <h1 className="text-[26px] tracking-[-0.03em] text-white md:text-[34px]">
                  {user.displayName}
                </h1>
                <p className="t-mono mt-1.5 text-faint">@{user.username}</p>
              </div>
            </div>
            <span className="t-mono w-fit rounded-full border border-line px-3 py-1.5 text-faint">
              {user.role.toUpperCase()}
            </span>
          </div>

          <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-muted">{user.bio}</p>
          <p className="t-mono mt-4 text-faint">
            JOINED {formatCommunityDate(user.joinedAt).toUpperCase()}
          </p>
        </Container>
      </header>

      <Section className="py-10 md:py-14">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <div className="flex items-baseline justify-between border-b border-line pb-4">
                <h2 className="text-[15px] text-white">Discussions started</h2>
                <span className="t-mono text-faint">{threads.length}</span>
              </div>

              {threads.length === 0 ? (
                <div className="mt-5 border border-dashed border-[#242424] px-6 py-12 text-center">
                  <p className="text-[13.5px] text-white">No discussions yet</p>
                  <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-faint">
                    {viewer?.username === user.username
                      ? "You have not started a discussion yet. Pick a category and ask something."
                      : "This member has not started a discussion yet."}
                  </p>
                  {viewer?.username === user.username ? (
                    <Link
                      href="/community/new"
                      className="mt-5 inline-flex h-10 items-center rounded-full bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
                    >
                      Start a discussion
                    </Link>
                  ) : null}
                </div>
              ) : (
                <ul className="mt-4 border-t border-line">
                  {threads.map((thread) => (
                    <li key={thread.slug}>
                      <Link
                        href={`/community/t/${thread.slug}`}
                        className="group flex items-start justify-between gap-6 border-b border-line py-5 transition-colors hover:bg-white/[0.015]"
                      >
                        <div>
                          <h3 className="text-[14.5px] text-white group-hover:text-muted">
                            {thread.title}
                          </h3>
                          <p className="t-mono mt-2 text-faint">
                            {formatCommunityDate(thread.createdAt)} ·{" "}
                            {thread.category.toUpperCase()}
                          </p>
                        </div>
                        <span className="t-mono inline-flex shrink-0 items-center gap-1.5 pt-1 text-faint">
                          <MessageSquare className="h-3 w-3" aria-hidden="true" />
                          {thread.replies}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="lg:col-span-3 lg:col-start-10">
              <div className="border-t border-line pt-6">
                <p className="t-label mb-4 text-faint">About this profile</p>
                <p className="text-[12.5px] leading-relaxed text-muted">
                  Public details only: display name, handle and the discussions this member
                  started. Email addresses are never shown on the site.
                </p>
                <Link href="/community" className="u-link mt-4 inline-block text-[12.5px] text-white">
                  All discussions
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
