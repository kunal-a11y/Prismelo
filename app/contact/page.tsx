import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container, Eyebrow, PageHeader } from "@/components/section";
import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Prismelo about software, security, cloud infrastructure or AI work.",
  alternates: { canonical: "/contact" },
};

const expectations = [
  {
    label: "01",
    title: "A reply from a person",
    body: "Enquiries are read and answered directly — not routed through a sales sequence.",
  },
  {
    label: "02",
    title: "A straight answer",
    body: "If the work is outside what we do, we will say so rather than stretching a proposal to fit.",
  },
  {
    label: "03",
    title: "A written scope",
    body: "If it looks like a fit, the next step is a short scope covering deliverables, exclusions and cost.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Start a conversation."
        lead="Describe the system, the constraint and the timeline. A few clear paragraphs are more useful than a specification."
      />

      <Container>
        <div className="grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-24">
              <Eyebrow className="mb-5">Direct</Eyebrow>
              <a
                href={`mailto:${site.contactEmail}`}
                className="block text-[19px] tracking-[-0.02em] text-white transition-colors hover:text-muted"
              >
                {site.contactEmail}
              </a>
              <p className="mt-2 text-[12px] text-faint">
                General enquiries, existing engagements and documentation
                corrections.
              </p>

              <div className="mt-8 border-t border-line pt-6">
                <p className="t-label mb-4 text-faint">What happens next</p>
                <ul className="flex flex-col gap-5">
                  {expectations.map((item) => (
                    <li key={item.label} className="flex gap-4">
                      <span className="t-mono pt-0.5 text-faint">{item.label}</span>
                      <div>
                        <p className="text-[13.5px] text-white">{item.title}</p>
                        <p className="t-body mt-1 text-[12.5px]">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border border-line bg-[#050505] p-4">
                <p className="t-label text-faint">Security issues</p>
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                  Do not use this form for vulnerabilities. Use the responsible
                  disclosure route so the report reaches the right place.
                </p>
                <Link
                  href="/docs/services/security-disclosure"
                  className="u-link mt-3 inline-block text-[12.5px] text-white"
                >
                  Responsible disclosure
                </Link>
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <p className="t-label mb-3 text-faint">Group</p>
                <a
                  href={site.ownedCompanies[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-white"
                >
                  {site.ownedCompanies[0].name}
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </a>
                <p className="mt-1.5 text-[11.5px] text-faint">
                  Product enquiries for HirenextAI are handled on its own site.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <Reveal>
          <div className="grid gap-8 border-t border-line py-10 md:grid-cols-3">
            <div>
              <p className="t-label text-faint">Website</p>
              <p className="mt-2 text-[13px] text-white">prismelo.tech</p>
            </div>
            <div>
              <p className="t-label text-faint">Company</p>
              <p className="mt-2 text-[13px] text-white">Prismelo Technology</p>
            </div>
            <div>
              <p className="t-label text-faint">Founder</p>
              <Link
                href="/founder"
                className="mt-2 inline-block text-[13px] text-white transition-colors hover:text-muted"
              >
                Kunal Purohit
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
