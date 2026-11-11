import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/section";
import { UnsubscribeForm } from "@/components/community/unsubscribe-form";
import { readStore } from "@/lib/community-store";
import { communityJson } from "@/lib/community-cloudflare";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const remote = token
    ? await communityJson<{ subscriber: { email: string; token: string; unsubscribedAt: string | null } }>(
        `/api/subscribe/status?token=${encodeURIComponent(token)}`,
      )
    : null;
  const subscriber = remote?.subscriber ?? (token
    ? readStore().subscribers.find((entry) => entry.token === token)
    : undefined);

  return (
    <Container className="flex min-h-[80vh] items-center justify-center pt-28 pb-16 md:pt-32 md:pb-20">
      <div className="w-full max-w-md text-center">
        <Eyebrow tone="violet" className="justify-center">
          Email
        </Eyebrow>

        {!subscriber ? (
          <>
            <h1 className="t-h2 mt-5 text-white">That link is not valid</h1>
            <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
              The unsubscribe link may have been truncated by your email client. Open the
              link again, or reply to any Prismelo email and ask to be removed.
            </p>
            <Link
              href="/resources"
              className="mt-6 inline-flex h-11 items-center rounded-full border border-line px-5 text-[13px] text-white transition-colors hover:border-white/45"
            >
              Back to resources
            </Link>
          </>
        ) : subscriber.unsubscribedAt ? (
          <>
            <h1 className="t-h2 mt-5 text-white">Already unsubscribed</h1>
            <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
              {subscriber.email} is not on the article email list.
            </p>
          </>
        ) : (
          <>
            <h1 className="t-h2 mt-5 text-white">Stop article emails?</h1>
            <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
              {subscriber.email} will stop receiving new-article emails. Replies to
              discussions you take part in are separate and are not affected.
            </p>
            <UnsubscribeForm token={subscriber.token} />
          </>
        )}
      </div>
    </Container>
  );
}
