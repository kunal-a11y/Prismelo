import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import {
  Container,
  CtaSection,
  Eyebrow,
  PageHeader,
  Section,
} from "@/components/section";
import { Reveal } from "@/components/reveal";
import { SubscribeForm } from "@/components/community/subscribe-form";
import { ResourceArt, ResourcesIndex } from "@/components/resources/resources-index";
import { getResources } from "@/lib/resources";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Notes on engineering, security, design and applied AI from Prismelo. Sample articles demonstrating the format.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  const resources = getResources();
  const featured = resources.find((item) => item.featured) ?? resources[0];
  const rest = resources.filter((item) => item.slug !== featured.slug);

  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Notes on engineering, security and applied AI."
        lead="Written pieces on the problems we actually encounter — testing, infrastructure, design systems and the practical limits of AI. No announcements, no thought-leadership."
        aside={
          <div className="flex items-start gap-3 border border-dashed border-[#2a2a2a] px-4 py-3.5 lg:mt-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
            <p className="text-[12px] leading-relaxed text-muted">
              <span className="text-white">Sample articles.</span> These pieces
              are published to demonstrate the format. They are not company news
              or client announcements.
            </p>
          </div>
        }
      />

      <Section className="py-12 md:py-16">
        <Container>
          <article className="group grid gap-8 border-b border-line pb-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="t-mono rounded-full border border-line px-2.5 py-1 text-white">
                  FEATURED
                </span>
                <span className="t-mono text-faint">
                  {featured.category.toUpperCase()}
                </span>
                <span className="t-mono text-faint">
                  {featured.readingTime} MIN READ
                </span>
              </div>

              <h2 className="t-h2 mt-6 max-w-[20ch] text-white">
                <Link href={`/resources/${featured.slug}`}>
                  {featured.title}
                </Link>
              </h2>
              <p className="t-lead mt-5 max-w-xl text-[15px] md:text-base">
                {featured.description}
              </p>
              <div className="mt-7 flex items-center gap-5">
                <Link
                  href={`/resources/${featured.slug}`}
                  className="arrow-link group text-white"
                >
                  Read article
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <span className="t-mono text-faint">
                  {formatDate(featured.date)}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <Link href={`/resources/${featured.slug}`} aria-label={featured.title}>
                <ResourceArt
                  category={featured.category}
                  className="aspect-[4/3] transition-colors group-hover:border-[#3a3a3a]"
                />
              </Link>
            </div>
          </article>

          <Reveal className="mt-12">
            <ResourcesIndex items={rest} />
          </Reveal>

          <div className="mt-14 grid gap-8 border-t border-line pt-8 md:grid-cols-3">
            <div>
              <h2 className="text-[14px] text-white">About this section</h2>
              <p className="t-body mt-2 text-[12.5px]">
                Articles are written by Prismelo and published as sample content
                until a real publishing cadence exists.
              </p>
            </div>
            <div>
              <h2 className="text-[14px] text-white">Looking for reference material?</h2>
              <p className="t-body mt-2 text-[12.5px]">
                Service scope, authorization requirements and integration
                contracts live in the documentation.
              </p>
              <Link
                href="/docs"
                className="u-link mt-3 inline-block text-[12.5px] text-white"
              >
                Open documentation
              </Link>
            </div>
            <div>
              <h2 className="text-[14px] text-white">Corrections welcome</h2>
              <p className="t-body mt-2 text-[12.5px]">
                If something here is wrong, email{" "}
                <a
                  href="mailto:hello@prismelo.tech"
                  className="u-link text-white"
                >
                  hello@prismelo.tech
                </a>{" "}
                with the article title.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section bordered className="py-14 md:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-6">
              <Eyebrow>Email</Eyebrow>
              <h2 className="t-h2 mt-5 max-w-md text-white">New articles, by email.</h2>
              <p className="t-body mt-4 max-w-md">
                One email when something new is published. No newsletter, no tracking
                pixels, no other use of the address.
              </p>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
              <SubscribeForm />
              <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
                Addresses come only from this form or from a forum account. Every email
                includes an unsubscribe link.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <CtaSection
        title="Have a problem worth writing about?"
        text="Most of these notes start as an engagement. If you are dealing with something similar, a short conversation is usually enough to find the shape of it."
      />
    </>
  );
}
