import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Container, Section } from "@/components/section";
import { ShareLink } from "@/components/community/share-link";
import { ReplyForm } from "@/components/community/reply-form";
import { CommunityAvatar, communityGuidelines } from "@/components/community/ui";
import {
  communityCategories,
  formatCommunityDate,
  formatCommunityDateTime,
  getCategory,
} from "@/lib/community";
import { getDiscussion, getThreadView, listDiscussions } from "@/lib/community-data";
import { currentCommunityUser } from "@/lib/community-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const discussion = getDiscussion(slug);
  if (!discussion) return { title: "Discussion not found" };
  return {
    title: discussion.title,
    description: discussion.excerpt,
    alternates: { canonical: `/community/t/${discussion.slug}` },
  };
}

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const view = getThreadView(slug);
  if (!view) notFound();

  const user = await currentCommunityUser();
  const discussion = getDiscussion(slug);
  const category = getCategory(view.thread.category);
  const related = listDiscussions()
    .filter(
      (item) =>
        item.category === view.thread.category && item.slug !== view.thread.slug,
    )
    .slice(0, 3);

  const replyCount = view.replies.length;

  return (
    <>
      <header className="border-b border-line">
        <Container className="pt-28 pb-10 md:pt-32 md:pb-12">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint">
            <Link href="/community" className="transition-colors hover:text-white">
              Community
            </Link>
            <span aria-hidden="true">/</span>
            {category ? (
              <Link
                href={`/community/c/${category.slug}`}
                className="transition-colors hover:text-white"
              >
                {category.name}
              </Link>
            ) : null}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <h1 className="text-[27px] leading-[1.12] tracking-[-0.03em] text-white md:text-[38px]">
                {view.thread.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex items-center gap-2.5">
                  <CommunityAvatar name={view.author.displayName} size="sm" />
                  <Link
                    href={`/community/u/${view.author.username}`}
                    className="text-[12.5px] text-white transition-colors hover:text-muted"
                  >
                    {view.author.displayName}
                  </Link>
                </div>
                <span className="t-mono text-faint">
                  {formatCommunityDate(view.thread.createdAt)}
                </span>
                <span className="t-mono inline-flex items-center gap-1.5 text-faint">
                  <MessageSquare className="h-3 w-3" aria-hidden="true" />
                  {replyCount} REPL{replyCount === 1 ? "Y" : "IES"}
                </span>
                {view.thread.locked ? (
                  <span className="t-mono border border-[#3a3a3a] px-2 py-0.5 text-faint">
                    LOCKED
                  </span>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              {category ? (
                <Link
                  href={`/community/c/${category.slug}`}
                  className="inline-flex items-center gap-2 border border-line px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-white/40 hover:text-white"
                >
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  {category.name}
                </Link>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      <Section className="py-10 md:py-14">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <article className="border border-line bg-[#050505] p-5 md:p-8">
                <div className="flex items-center gap-2.5 border-b border-line pb-4">
                  <CommunityAvatar name={view.author.displayName} size="sm" />
                  <div>
                    <Link
                      href={`/community/u/${view.author.username}`}
                      className="block text-[13px] text-white transition-colors hover:text-muted"
                    >
                      {view.author.displayName}
                    </Link>
                    <p className="t-mono mt-0.5 text-faint">@{view.author.username}</p>
                  </div>
                  <span className="t-mono ml-auto text-faint">
                    {formatCommunityDateTime(view.thread.createdAt)}
                  </span>
                </div>

                <div className="mt-6 flex max-w-2xl flex-col gap-4">
                  {discussion?.body.map((paragraph, index) => (
                    <p key={index} className="text-[14px] leading-[1.75] text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                  <ShareLink />
                </div>
              </article>

              <div className="mt-12">
                <div className="flex items-baseline justify-between border-b border-line pb-4">
                  <h2 className="text-[15px] text-white">
                    {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </h2>
                  <span className="t-mono text-faint">
                    {replyCount === 0 ? "NO REPLIES YET" : "OLDEST FIRST"}
                  </span>
                </div>

                {replyCount === 0 ? (
                  <p className="border-b border-line py-8 text-[13px] leading-relaxed text-muted">
                    No replies yet. {user ? "Write the first one below." : "Sign in to add the first reply."}
                  </p>
                ) : (
                  <ul className="flex flex-col">
                    {view.replies.map((reply) => (
                      <li key={reply.id} className="border-b border-line py-6 last:border-b-0">
                        <div className="flex items-start gap-3.5">
                          <CommunityAvatar name={reply.author.displayName} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <Link
                                href={`/community/u/${reply.author.username}`}
                                className="text-[12.5px] text-white transition-colors hover:text-muted"
                              >
                                {reply.author.displayName}
                              </Link>
                              <span className="t-mono text-faint">
                                {formatCommunityDateTime(reply.createdAt)}
                              </span>
                            </div>
                            <div className="mt-2.5 flex max-w-2xl flex-col gap-3">
                              {reply.body.map((paragraph, index) => (
                                <p key={index} className="text-[13.5px] leading-relaxed text-muted">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-10">
                {user && !view.thread.locked ? (
                  <ReplyForm slug={view.thread.slug} />
                ) : user ? (
                  <div className="border border-line bg-[#050505] p-5 md:p-6">
                    <h2 className="text-[15px] text-white">This discussion is locked</h2>
                    <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
                      A moderator closed this thread. Start a new discussion if the topic
                      needs to continue.
                    </p>
                    <Link
                      href="/community/new"
                      className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
                    >
                      Start a discussion
                    </Link>
                  </div>
                ) : (
                  <div className="border border-line bg-[#050505] p-5 md:p-6">
                    <h2 className="text-[15px] text-white">Join the discussion</h2>
                    <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
                      Replying needs a community account. You will get an email when someone
                      replies after you.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/community/login?next=${encodeURIComponent(`/community/t/${view.thread.slug}`)}`}
                        className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
                      >
                        Sign in to reply
                      </Link>
                      <Link
                        href="/community/register"
                        className="inline-flex h-10 items-center rounded-full border border-line px-4 text-[13px] text-white transition-colors hover:border-white/45"
                      >
                        Create an account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="lg:col-span-3 lg:col-start-10">
              <div className="lg:sticky lg:top-24">
                <div>
                  <p className="t-label mb-4 text-faint">In this category</p>
                  <p className="text-[13px] leading-relaxed text-muted">
                    {category?.description}
                  </p>
                </div>

                {related.length ? (
                  <div className="mt-8 border-t border-line pt-6">
                    <p className="t-label mb-4 text-faint">Related</p>
                    <ul className="flex flex-col gap-4">
                      {related.map((item) => (
                        <li key={item.slug}>
                          <Link href={`/community/t/${item.slug}`} className="group block">
                            <span className="block text-[12.5px] leading-snug text-white group-hover:text-muted">
                              {item.title}
                            </span>
                            <span className="t-mono mt-1 block text-faint">
                              {item.replies} REPLIES
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-8 border-t border-line pt-6">
                  <p className="t-label mb-4 text-faint">Guidelines</p>
                  <ul className="flex flex-col gap-3">
                    {communityGuidelines.slice(1).map((rule) => (
                      <li
                        key={rule}
                        className="flex gap-2.5 text-[12px] leading-relaxed text-muted"
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

                <div className="mt-8 border-t border-line pt-6">
                  <p className="t-label mb-3 text-faint">Categories</p>
                  <ul className="flex flex-col gap-2">
                    {communityCategories.slice(0, 4).map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/community/c/${item.slug}`}
                          className="text-[12px] text-muted transition-colors hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
