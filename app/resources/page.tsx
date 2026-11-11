import type { Metadata } from "next";
import Link from "next/link";
import {
  Container,
  CtaSection,
  Eyebrow,
  PageHeader,
  Section,
} from "@/components/section";
import { SubscribeForm } from "@/components/community/subscribe-form";
import { ResourceArt } from "@/components/resources/resources-index";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Technical articles and reference material from Prismelo Technology.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Resources from Prismelo."
        lead="Technical articles and reference material will appear here when they are ready to publish."
      />

      <Section className="py-12 md:py-16">
        <Container>
          <div className="grid items-center gap-10 border-b border-line pb-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className="t-mono text-faint">NO ARTICLES PUBLISHED</p>
              <h2 className="t-h2 mt-5 max-w-[20ch] text-white">
                This space is ready for what comes next.
              </h2>
              <p className="t-lead mt-5 max-w-xl text-[15px] md:text-base">
                There are no articles here yet. For current reference material,
                visit the documentation.
              </p>
              <Link href="/docs" className="arrow-link mt-7 inline-flex text-white">
                Open documentation
              </Link>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <ResourceArt category="Security" className="aspect-[4/3]" />
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
