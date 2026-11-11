import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, MailWarning } from "lucide-react";
import { Container, Eyebrow } from "@/components/section";
import {
  DeleteButton,
  ThreadAdminActions,
} from "@/components/admin/community-actions";
import { isAdmin } from "@/lib/admin-auth";
import { emailConfigured, readMailLog } from "@/lib/email";
import { communityApi } from "@/lib/community-cloudflare";
import { formatCommunityDate, formatCommunityDateTime } from "@/lib/community";
import { readStore } from "@/lib/community-store";

export const metadata: Metadata = {
  title: "Community",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  const response = await communityApi("/api/admin/community/overview", true);
  if (response && response.status === 401) redirect("/admin/login");
  if (!response && !(await isAdmin())) redirect("/admin/login");

  type ApiUser = { id: string; username: string; name: string } | null;
  type ApiThread = {
    id: string; slug: string; title: string; category: string; authorId: string;
    createdAt: string; locked: boolean; pinned: boolean; replyCount: number; author: ApiUser;
  };
  type ApiReply = {
    id: string; body: string; createdAt: string; author: ApiUser;
    thread: { slug: string; title: string } | null;
  };
  type ApiSubscriber = {
    id: string; email: string; source: string; createdAt: string; unsubscribedAt: string | null;
  };
  type ApiMail = {
    id: string; kind: string; status: "sent" | "failed" | "skipped"; recipient: string;
    subject: string; detail: string; created_at: string;
  };
  const overview = response?.ok
    ? (await response.json()) as {
        threads: ApiThread[]; replies: ApiReply[]; replyTotal: number; memberCount: number;
        subscribers: ApiSubscriber[]; mail: ApiMail[];
      }
    : null;
  const store = overview ? null : readStore();
  const log = overview
    ? overview.mail.map((entry) => ({
        id: entry.id, kind: entry.kind, status: entry.status, to: entry.recipient,
        subject: entry.subject, at: entry.created_at, error: entry.detail || undefined,
      }))
    : readMailLog();
  const localAuthorOf = (id: string) => store?.users.find((user) => user.id === id) ?? null;
  const threads = overview?.threads ?? [...(store?.threads ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const recentReplies = overview?.replies ?? [...(store?.replies ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);
  const replyTotal = overview?.replyTotal ?? store?.replies.length ?? 0;
  const memberCount = overview?.memberCount ?? store?.users.length ?? 0;
  const activeSubscribers = (overview?.subscribers ?? store?.subscribers ?? [])
    .filter((entry) => !entry.unsubscribedAt);
  const sent = log.filter((entry) => entry.status === "sent").length;
  const skipped = log.filter((entry) => entry.status === "skipped").length;
  const failed = log.filter((entry) => entry.status === "failed").length;

  return (
    <Container className="py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <Eyebrow tone="violet">Community</Eyebrow>
          <h1 className="t-h2 mt-5 text-white">Forum</h1>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted">
            Threads, replies, members and email delivery. Deleting a thread removes its
            replies too.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {[
            ["THREADS", threads.length],
            ["REPLIES", replyTotal],
            ["MEMBERS", memberCount],
            ["SUBSCRIBERS", activeSubscribers.length],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <p className="t-mono text-faint">{label}</p>
              <p className="mt-1 text-[22px] leading-none text-white">{value}</p>
            </div>
          ))}
          <Link
            href="/community"
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[13px] text-white transition-colors hover:border-white/45"
          >
            View forum
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {!emailConfigured() ? (
        <div className="mt-8 flex flex-col gap-3 border border-dashed border-[#3a3a3a] px-4 py-4 sm:flex-row sm:items-start">
          <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-[#ffbf66]" aria-hidden="true" />
          <div>
            <p className="text-[13px] text-white">Notification email is not configured</p>
            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-muted">
              Every notification is being recorded as <span className="text-white">skipped</span>{" "}
              instead of sent. Set <code className="text-white">SMTP_HOST</code>,{" "}
              <code className="text-white">SMTP_USER</code>,{" "}
              <code className="text-white">SMTP_PASS</code> and{" "}
              <code className="text-white">EMAIL_FROM</code> (a verified sender) in{" "}
              <code className="text-white">.env.local</code>, then restart the server. The same
              relay already powers the contact form.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-6 t-mono text-faint">
          EMAIL DELIVERY ACTIVE · {sent} SENT · {failed} FAILED · {skipped} SKIPPED
        </p>
      )}

      <section className="mt-12">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="text-[15px] text-white">Discussions</h2>
          <span className="t-mono text-faint">{threads.length}</span>
        </div>

        {threads.length === 0 ? (
          <p className="py-8 text-[13px] leading-relaxed text-muted">
            No threads yet. Members create them from{" "}
            <Link href="/community" className="u-link text-white">
              /community
            </Link>
            .
          </p>
        ) : (
          <ul className="border-t border-line">
            {threads.map((thread) => {
              const author = "author" in thread ? thread.author : localAuthorOf(thread.authorId);
              const replies = "replyCount" in thread
                ? thread.replyCount
                : store?.replies.filter((reply) => reply.threadId === thread.id).length ?? 0;
              return (
                <li
                  key={thread.id}
                  className="grid gap-4 border-b border-line py-5 md:grid-cols-12 md:items-center md:gap-6"
                >
                  <div className="md:col-span-7">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {thread.pinned ? (
                        <span className="t-mono border border-[#ffbf66]/40 px-2 py-0.5 text-[#ffbf66]">
                          PINNED
                        </span>
                      ) : null}
                      <span
                        className={`t-mono border px-2 py-0.5 ${
                          thread.locked
                            ? "border-[#3a3a3a] text-faint"
                            : "border-[#c3f24f]/40 text-[#c3f24f]"
                        }`}
                      >
                        {thread.locked ? "LOCKED" : "OPEN"}
                      </span>
                      <span className="t-mono text-faint">{thread.category.toUpperCase()}</span>
                      <span className="t-mono text-faint">
                        {formatCommunityDate(thread.createdAt)}
                      </span>
                    </div>
                    <Link
                      href={`/community/t/${thread.slug}`}
                      target="_blank"
                      className="mt-2 block text-[15px] leading-snug text-white transition-colors hover:text-muted"
                    >
                      {thread.title}
                    </Link>
                    <p className="mt-1.5 text-[12px] text-faint">
                      {author ? `${author.name} (@${author.username})` : "Deleted member"} ·{" "}
                      {replies} {replies === 1 ? "reply" : "replies"}
                    </p>
                  </div>

                  <div className="md:col-span-5 md:justify-end md:flex">
                    <ThreadAdminActions
                      id={thread.id}
                      title={thread.title}
                      locked={thread.locked}
                      pinned={thread.pinned}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="text-[15px] text-white">Recent replies</h2>
          <span className="t-mono text-faint">LAST {recentReplies.length}</span>
        </div>

        {recentReplies.length === 0 ? (
          <p className="py-8 text-[13px] leading-relaxed text-muted">No replies yet.</p>
        ) : (
          <ul className="border-t border-line">
            {recentReplies.map((reply) => {
              const author = "author" in reply ? reply.author : localAuthorOf(reply.authorId);
              const thread = "thread" in reply
                ? reply.thread
                : store?.threads.find((entry) => entry.id === reply.threadId) ?? null;
              return (
                <li key={reply.id} className="border-b border-line py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[12.5px] text-white">
                      {author ? author.name : "Deleted member"}
                    </span>
                    <span className="t-mono text-faint">
                      {formatCommunityDateTime(reply.createdAt)}
                    </span>
                    {thread ? (
                      <Link
                        href={`/community/t/${thread.slug}`}
                        target="_blank"
                        className="text-[12px] text-muted transition-colors hover:text-white"
                      >
                        {thread.title}
                      </Link>
                    ) : null}
                    <span className="ml-auto">
                      <DeleteButton
                        url={`/api/admin/community/replies/${reply.id}`}
                        confirmText="Delete this reply permanently?"
                      />
                    </span>
                  </div>
                  <p className="mt-2 max-w-3xl text-[12.5px] leading-relaxed text-muted">
                    {reply.body.length > 260 ? `${reply.body.slice(0, 260)}…` : reply.body}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <h2 className="text-[15px] text-white">Email list</h2>
            <span className="t-mono text-faint">{activeSubscribers.length} ACTIVE</span>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-faint">
            Addresses are only here because someone typed theirs into the subscribe form or
            created a forum account. There is no way to collect them from visitors, and no
            address is ever displayed publicly.
          </p>

          {activeSubscribers.length === 0 ? (
            <p className="py-6 text-[13px] text-muted">No subscribers yet.</p>
          ) : (
            <ul className="mt-4 border-t border-line">
              {activeSubscribers.slice(0, 15).map((subscriber) => (
                <li
                  key={subscriber.id}
                  className="flex items-center justify-between gap-4 border-b border-line py-3"
                >
                  <div>
                    <p className="text-[12.5px] text-white">{subscriber.email}</p>
                    <p className="t-mono mt-0.5 text-faint">
                      {subscriber.source.toUpperCase()} ·{" "}
                      {formatCommunityDate(subscriber.createdAt)}
                    </p>
                  </div>
                  <DeleteButton
                    url={`/api/admin/community/subscribers/${subscriber.id}`}
                    confirmText={`Remove ${subscriber.email} from the email list?`}
                    label="Remove"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <h2 className="text-[15px] text-white">Email log</h2>
            <span className="t-mono text-faint">LAST {Math.min(log.length, 15)}</span>
          </div>

          {log.length === 0 ? (
            <p className="py-6 text-[13px] leading-relaxed text-muted">
              Nothing sent yet. Publishing a post, creating a thread or replying writes an
              entry here — sent, failed or skipped.
            </p>
          ) : (
            <ul className="mt-4 border-t border-line">
              {log.slice(0, 15).map((entry) => (
                <li key={entry.id} className="border-b border-line py-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`t-mono border px-2 py-0.5 ${
                        entry.status === "sent"
                          ? "border-[#c3f24f]/40 text-[#c3f24f]"
                          : entry.status === "failed"
                            ? "border-white/50 text-white"
                            : "border-[#3a3a3a] text-faint"
                      }`}
                    >
                      {entry.status.toUpperCase()}
                    </span>
                    <span className="t-mono text-faint">{entry.kind}</span>
                    <span className="t-mono ml-auto text-faint">
                      {formatCommunityDateTime(entry.at)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-white">{entry.subject}</p>
                  <p className="text-[11.5px] text-faint">{entry.to}</p>
                  {entry.error ? (
                    <p className="mt-1 text-[11px] leading-relaxed text-[#ffbf66]">
                      {entry.error}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Container>
  );
}
