import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import {
  Container,
  CtaSection,
  Eyebrow,
  PageHeader,
  Section,
} from "@/components/section";
import { Reveal } from "@/components/reveal";
import { EcosystemArt } from "@/components/art";
import { ButtonLink } from "@/components/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "The Prismelo group: technology companies and products built and operated by Prismelo. HirenextAI is the group's active AI recruitment technology company.",
  alternates: { canonical: "/companies" },
};

const structure = [
  {
    label: "Ownership",
    body: "Each company in the group is owned and operated by Prismelo. Ownership is stated on this page and is not inferred from shared branding.",
  },
  {
    label: "Identity",
    body: "Products keep their own name, domain and product direction. The Prismelo name indicates the engineering group behind them, not a single shared product.",
  },
  {
    label: "Shared practice",
    body: "Companies draw on the same engineering, security and infrastructure practice — which is why the group can build regulated, sensitive systems with confidence.",
  },
];

export default function CompaniesPage() {
  const [hirenext] = site.ownedCompanies;

  return (
    <>
      <PageHeader
        eyebrow="Companies"
        title="A technology group with products of its own."
        lead="Prismelo builds client systems and its own companies. The group is small by design: every company listed here is real, active and operated by us."
      >
        <div className="border border-line bg-[#050505] p-4 md:p-8">
          <EcosystemArt />
        </div>
      </PageHeader>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <Reveal>
                <Eyebrow className="mb-6">Active company</Eyebrow>
                <h2 className="t-h2 max-w-[12ch] text-white">
                  The group today.
                </h2>
                <p className="t-body mt-6 max-w-xs">
                  One active company alongside Prismelo itself. Additional
                  companies are listed only when they exist.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={0.06}>
                <article className="border border-line bg-[#080808]">
                  <div className="flex flex-col gap-5 border-b border-line p-6 sm:flex-row sm:items-start sm:justify-between md:p-8">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-[30px] tracking-[-0.035em] text-white md:text-[38px]">
                          {hirenext.name}
                        </h3>
                        <span className="flex items-center gap-2 rounded-full border border-line px-2.5 py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          <span className="t-mono text-white">
                            {hirenext.status}
                          </span>
                        </span>
                      </div>
                      <p className="mt-3 text-[13px] text-muted">
                        {hirenext.industry}
                      </p>
                    </div>
                    <ButtonLink
                      href={hirenext.url}
                      external
                      variant="secondary"
                      size="sm"
                      withArrow
                    >
                      Visit website
                    </ButtonLink>
                  </div>

                  <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
                    <div>
                      <p className="t-label text-faint">Relationship</p>
                      <p className="mt-2 text-[14px] text-white">
                        {hirenext.relationship}
                      </p>
                      <p className="t-body mt-4 text-[13.5px]">
                        {hirenext.summary}
                      </p>
                    </div>
                    <dl className="grid grid-cols-2 gap-5 border-t border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                      <div>
                        <dt className="t-label text-faint">Status</dt>
                        <dd className="mt-2 text-[13.5px] text-white">
                          Active
                        </dd>
                      </div>
                      <div>
                        <dt className="t-label text-faint">Industry</dt>
                        <dd className="mt-2 text-[13.5px] text-white">
                          AI / Recruitment
                        </dd>
                      </div>
                      <div>
                        <dt className="t-label text-faint">Ownership</dt>
                        <dd className="mt-2 text-[13.5px] text-white">
                          Prismelo
                        </dd>
                      </div>
                      <div>
                        <dt className="t-label text-faint">Domain</dt>
                        <dd className="mt-2">
                          <a
                            href={hirenext.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[13.5px] text-white underline decoration-[#3f3f3f] underline-offset-4 hover:decoration-white"
                          >
                            hirenextai.com
                            <ArrowUpRight
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section bordered className="bg-[#020202]">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            {structure.map((item, index) => (
              <Reveal key={item.label} delay={index * 0.06}>
                <div className="border-t border-line pt-6">
                  <div className="flex items-baseline justify-between">
                    <p className="t-label text-white">{item.label}</p>
                    <span className="t-mono text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="t-body mt-4 text-[13.5px]">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section bordered>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow className="mb-6">Future companies</Eyebrow>
                <h2 className="t-h2 max-w-[18ch] text-white">
                  The structure is designed to grow.
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <Reveal delay={0.08}>
                <p className="t-body">
                  Prismelo is organised so that new companies and products can be
                  added without changing how the group works. Each would appear
                  here with its own name, industry, ownership relationship and
                  status.
                </p>
                <p className="t-body mt-4">
                  No further subsidiaries or products are announced. Names,
                  logos and launch dates are not published ahead of a real
                  launch.
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="mt-8 flex items-center gap-4 border border-dashed border-[#242424] px-5 py-4">
                  <span className="h-2 w-2 shrink-0 rounded-full border border-[#3a3a3a]" />
                  <p className="t-mono text-faint">
                    AWAITING ANNOUNCEMENT — NONE SCHEDULED
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <CtaSection
        title="Building something in the group's space?"
        text="We are open to conversations about products, partnerships and engineering work."
        secondary={{ label: "About Prismelo", href: "/about" }}
      />
    </>
  );
}
