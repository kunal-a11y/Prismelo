import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import {
  Container,
  CtaSection,
  Eyebrow,
  Section,
} from "@/components/section";
import { Reveal, FadeIn } from "@/components/reveal";
import { FounderProfileArt } from "@/components/art";
import { ButtonLink } from "@/components/button";
import { site } from "@/lib/site";
import { founderPhoto } from "@/lib/founder-photo";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Founder",
  description:
    "Kunal Purohit, founder of Prismelo Technology — building technology products across software engineering, cybersecurity and AI.",
  alternates: { canonical: "/founder" },
};

const focusAreas = [
  {
    label: "Products",
    title: "Building software with a user",
    body: "Product work at Prismelo starts from a real workflow and a real cost. The measure is whether the finished system is used, not whether it shipped.",
  },
  {
    label: "Security",
    title: "Engineering with the threat in view",
    body: "Security decisions are made during design: what data exists, who can reach it, what happens when a component fails or is compromised.",
  },
  {
    label: "Intelligence",
    title: "Applying AI where it is measurable",
    body: "AI work is treated as engineering: a defined task, an evaluation set, and an honest account of where the model is not reliable.",
  },
];

export default function FounderPage() {
  const photo = founderPhoto();

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, #161616 1px, transparent 1px)",
            backgroundSize: "25% 100%",
          }}
        />
        <Container className="relative pt-32 md:pt-40">
          <div className="grid gap-12 pb-14 lg:grid-cols-12 lg:gap-10 lg:pb-20">
            <div className="lg:col-span-7">
              <FadeIn>
                <Eyebrow>Founder</Eyebrow>
                <h1 className="t-display mt-8 text-white">Kunal Purohit</h1>
                <p className="mt-6 text-[15px] text-muted">
                  Founder of Prismelo Technology
                </p>
              </FadeIn>
              <FadeIn delay={0.14}>
                <p className="t-lead mt-8 max-w-lg">
                  Building technology products and engineering systems across
                  software, cybersecurity and AI — with a preference for work
                  that has to hold up under real use.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <ButtonLink href="/contact" size="lg">
                    Get in touch
                  </ButtonLink>
                  <ButtonLink href="/companies" variant="secondary" size="lg">
                    The company group
                  </ButtonLink>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.18} className="lg:col-span-4 lg:col-start-9">
              <div className="founder-card relative border border-line bg-[#050505]">
                <span aria-hidden="true" className="founder-card__glow" />
                <span aria-hidden="true" className="founder-card__scan" />
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
                  <FounderProfileArt />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="founder-portrait">
                      <span
                        aria-hidden="true"
                        className="founder-portrait__glow"
                      />
                      <span
                        aria-hidden="true"
                        className="founder-portrait__ring"
                      />
                      <span
                        aria-hidden="true"
                        className="founder-portrait__orbit"
                      >
                        <span />
                      </span>
                      <div className="founder-portrait__frame">
                        {photo ? (
                          <Image
                            src={photo}
                            alt={`${site.founder}, founder of Prismelo Technology`}
                            fill
                            sizes="(max-width: 1024px) 62vw, 320px"
                            className="object-cover founder-portrait__photo"
                            priority
                          />
                        ) : (
                          <div className="founder-portrait__initials">
                            <strong>KP</strong>
                            <span>Founder</span>
                          </div>
                        )}
                        <span
                          aria-hidden="true"
                          className="founder-portrait__sheen"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-line px-4 py-3">
                  <span className="t-mono text-faint">PRISMELO / PROFILE</span>
                  <a
                    href={site.url}
                    className="t-mono inline-flex items-center gap-1 text-faint transition-colors hover:text-white"
                  >
                    prismelo.tech
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </header>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-3">
              <Reveal>
                <Eyebrow>Introduction</Eyebrow>
              </Reveal>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal>
                <p className="text-[21px] leading-[1.5] tracking-[-0.02em] text-white md:text-[25px]">
                  Prismelo began from a straightforward position: most technology
                  problems are not mysteries. They are engineering problems that
                  were not given the time, structure or honesty they required.
                </p>
              </Reveal>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Reveal delay={0.06}>
                  <p className="t-body">
                    Kunal works across the full arc of a system — the product
                    decision, the architecture, the implementation and the
                    security posture it ends up with. That range is deliberate:
                    it keeps early choices connected to their operational
                    consequences.
                  </p>
                </Reveal>
                <Reveal delay={0.12}>
                  <p className="t-body">
                    Alongside client engineering, he builds and operates products
                    within the group, including HirenextAI. The founding
                    principle is restraint: fewer claims, more working software,
                    and systems documented well enough to outlive the people who
                    built them.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section bordered className="bg-[#020202]">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            {focusAreas.map((area, index) => (
              <Reveal key={area.label} delay={index * 0.06}>
                <div
                  className="focus-card border-t border-line pt-6"
                  style={{ "--rule-delay": `${index * 1.1}s` } as CSSProperties}
                >
                  <div className="flex items-baseline justify-between">
                    <p className="t-mono text-white">
                      {area.label.toUpperCase()}
                    </p>
                    <span className="t-mono text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="mt-7 text-[17px] leading-snug text-white">
                    {area.title}
                  </h2>
                  <p className="t-body mt-3 text-[13.5px]">{area.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section bordered>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow className="mb-6">Profile details</Eyebrow>
                <h2 className="t-h2 max-w-[16ch] text-white">
                  Only verified information.
                </h2>
                <p className="t-body mt-6 max-w-sm">
                  This profile intentionally contains confirmed details only.
                  Education, prior employment, certifications and professional
                  achievements are not published until they can be verified.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal delay={0.08}>
                <div className="border border-line bg-[#050505]">
                  <div className="flex items-center justify-between border-b border-line px-5 py-3">
                    <span className="t-label text-faint">Verified record</span>
                    <span className="t-mono text-faint">04 FIELDS</span>
                  </div>
                  <dl>
                    {[
                      { label: "Name", value: "Kunal Purohit" },
                      { label: "Role", value: "Founder, Prismelo Technology" },
                      { label: "Company", value: "Prismelo Technology" },
                      { label: "Owned company", value: "HirenextAI" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-2 gap-4 border-b border-line px-5 py-4"
                      >
                        <dt className="t-label self-center text-faint">
                          {row.label}
                        </dt>
                        <dd className="text-[13.5px] text-white">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-[#4a4a4a]" />
                    <p className="text-[12.5px] leading-relaxed text-faint">
                      This record is structured to expand. Additional verified
                      details — education, employment history, certifications —
                      will be published here when confirmed.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.14}>
                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="u-link text-[13.5px] text-white"
                  >
                    {site.contactEmail}
                  </a>
                  <a
                    href={site.ownedCompanies[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13.5px] text-muted transition-colors hover:text-white"
                  >
                    hirenextai.com
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <CtaSection
        title="Talk directly."
        text="For work enquiries, partnerships or product questions, contact Prismelo and the message goes to the founder."
      />
    </>
  );
}
