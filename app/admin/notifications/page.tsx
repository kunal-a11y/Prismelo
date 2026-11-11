import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MailWarning } from "lucide-react";
import { Container, Eyebrow } from "@/components/section";
import { LegalNotifyForm } from "@/components/admin/legal-notify-form";
import { isAdmin } from "@/lib/admin-auth";
import { emailConfigured, readMailLog } from "@/lib/email";
import { legalStatus } from "@/lib/legal";
import { readStore } from "@/lib/community-store";
import { formatCommunityDateTime } from "@/lib/community";
import { communityApi } from "@/lib/community-cloudflare";

export const metadata: Metadata = {
  title: "Policy notices",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const statuses = legalStatus();
  const response = await communityApi("/api/admin/community/overview", true);
  if (response?.status === 401) redirect("/admin/login");
  if (!response && !(await isAdmin())) redirect("/admin/login");
  const overview = response?.ok
    ? (await response.json()) as {
        subscribers: Array<{ unsubscribedAt: string | null }>;
        mail: Array<{ id: string; kind: string; status: "sent" | "failed" | "skipped"; recipient: string; subject: string; created_at: string }>;
      }
    : null;
  const subscribers = overview
    ? overview.subscribers.filter((entry) => !entry.unsubscribedAt)
    : readStore().subscribers.filter((entry) => !entry.unsubscribedAt);
  const log = overview
    ? overview.mail.map((entry) => ({
        id: entry.id, kind: entry.kind, status: entry.status, to: entry.recipient,
        subject: entry.subject, at: entry.created_at,
      }))
    : readMailLog();
  const configured = emailConfigured();

  return (
    <Container className="py-12 md:py-16">
      <div className="border-b border-line pb-8">
        <Eyebrow tone="violet">Email</Eyebrow>
        <h1 className="t-h2 mt-5 text-white">Policy notices</h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">
          When the privacy policy or terms change, subscribers can be told once. The site
          detects a change from the page source and shows it here — nothing is emailed
          automatically, because a wording fix is not always worth an email.
        </p>
      </div>

      {!configured ? (
        <div className="mt-8 flex flex-col gap-3 border border-dashed border-[#3a3a3a] px-4 py-4 sm:flex-row sm:items-start">
          <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-[#ffbf66]" aria-hidden="true" />
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-muted">
            <span className="text-white">Email is not configured, so notices cannot be sent.</span>{" "}
            Set <code className="text-white">SMTP_HOST</code>,{" "}
            <code className="text-white">SMTP_USER</code>,{" "}
            <code className="text-white">SMTP_PASS</code> and{" "}
            <code className="text-white">EMAIL_FROM</code> in <code className="text-white">.env.local</code>{" "}
            and restart. You can still record the current version below without emailing.
          </p>
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {statuses.map((status) => (
          <section key={status.key} className="border border-line bg-[#050505] p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[15px] text-white">{status.label}</h2>
              <span
                className={`t-mono border px-2 py-0.5 ${
                  status.changed
                    ? "border-[#ffbf66]/50 text-[#ffbf66]"
                    : status.unrecorded
                      ? "border-[#3a3a3a] text-faint"
                      : "border-[#c3f24f]/40 text-[#c3f24f]"
                }`}
              >
                {status.changed ? "CHANGED" : status.unrecorded ? "NOT RECORDED" : "UP TO DATE"}
              </span>
            </div>

            <p className="mt-2 text-[12px] leading-relaxed text-faint">
              {status.changed
                ? "The page has changed since the last notice was sent."
                : status.unrecorded
                  ? "No notice has been recorded yet. Record the current version to start tracking, or email subscribers if this version was just published."
                  : status.notifiedAt
                    ? `Last notice: ${formatCommunityDateTime(status.notifiedAt)}`
                    : "Up to date."}
            </p>

            <p className="t-mono mt-3 text-faint">VERSION {status.hash || "UNREADABLE"}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href={status.path}
                target="_blank"
                className="text-[12px] text-muted transition-colors hover:text-white"
              >
                Open the page
              </Link>
              <span className="text-[11.5px] text-faint">
                {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}
              </span>
            </div>

            <LegalNotifyForm
              legalKey={status.key}
              label={status.label}
              changed={status.changed}
              subscriberCount={subscribers.length}
            />
          </section>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="text-[15px] text-white">Recent delivery</h2>
          <span className="t-mono text-faint">LAST {Math.min(log.length, 8)}</span>
        </div>

        {log.length === 0 ? (
          <p className="py-6 text-[13px] leading-relaxed text-muted">
            No email has been attempted yet. Delivery attempts appear here and in{" "}
            <Link href="/admin/community" className="u-link text-white">
              the community log
            </Link>
            .
          </p>
        ) : (
          <ul className="border-t border-line">
            {log.slice(0, 8).map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line py-3"
              >
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
                <span className="text-[12.5px] text-white">{entry.subject}</span>
                <span className="t-mono ml-auto text-faint">
                  {formatCommunityDateTime(entry.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
