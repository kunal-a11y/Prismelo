import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, PenLine, Plus } from "lucide-react";
import { Container, Eyebrow } from "@/components/section";
import { ButtonLink } from "@/components/button";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { isAdmin } from "@/lib/admin-auth";
import { listAdminPosts } from "@/lib/admin-posts";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Posts",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const posts = listAdminPosts();
  const published = posts.filter((post) => !post.draft).length;
  const drafts = posts.length - published;

  return (
    <Container className="py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <Eyebrow tone="violet">Publishing</Eyebrow>
          <h1 className="t-h2 mt-5 text-white">Resources</h1>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted">
            Write and publish articles for <code className="text-white">/resources</code>.
            Nothing here is public except a published post.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="t-mono text-faint">PUBLISHED</p>
            <p className="mt-1 text-[22px] leading-none text-white">{published}</p>
          </div>
          <div>
            <p className="t-mono text-faint">DRAFTS</p>
            <p className="mt-1 text-[22px] leading-none text-white">{drafts}</p>
          </div>
          <ButtonLink href="/admin/new" withArrow>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New post
          </ButtonLink>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 border border-dashed border-[#3a3a3a] p-10 text-center">
          <h2 className="text-[16px] text-white">No posts yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            Write the first one — a title, one sentence and a few paragraphs is enough to
            publish.
          </p>
          <ButtonLink href="/admin/new" className="mt-6" withArrow>
            Write the first post
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-2 border-t border-line">
          {posts.map((post) => (
            <li
              key={`${post.draft ? "draft" : "post"}-${post.slug}`}
              className="grid gap-4 border-b border-line py-5 md:grid-cols-12 md:items-center md:gap-6"
            >
              <div className="md:col-span-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`t-mono border px-2 py-0.5 ${
                      post.draft
                        ? "border-[#3a3a3a] text-faint"
                        : "border-[#c3f24f]/40 text-[#c3f24f]"
                    }`}
                  >
                    {post.draft ? "DRAFT" : "LIVE"}
                  </span>
                  <span className="t-mono text-faint">{post.category.toUpperCase()}</span>
                  <span className="t-mono text-faint">{formatDate(post.date)}</span>
                  {post.featured ? (
                    <span className="t-mono text-[#ffbf66]">FEATURED</span>
                  ) : null}
                </div>

                <Link
                  href={`/admin/resources/${post.slug}`}
                  className="mt-2 block text-[15px] leading-snug text-white transition-colors hover:text-muted"
                >
                  {post.title || "(untitled)"}
                </Link>
                <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-faint">
                  {post.description || "No description yet."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 md:col-span-5 md:justify-end">
                <Link
                  href={`/admin/resources/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-[11.5px] text-white transition-colors hover:text-muted"
                >
                  <PenLine className="h-3 w-3" aria-hidden="true" />
                  Edit
                </Link>

                {post.draft ? null : (
                  <Link
                    href={`/resources/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-white"
                  >
                    View
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                )}

                <PostRowActions slug={post.slug} draft={post.draft} title={post.title} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-[11.5px] leading-relaxed text-faint">
        Posts are files in <code className="text-muted">content/resources</code>, written by
        this server. Authoring therefore needs a host with a writable, persistent disk — a
        self-hosted Node server. On a serverless host, commit the file instead.
      </p>
    </Container>
  );
}
