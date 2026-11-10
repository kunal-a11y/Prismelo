import type { Metadata } from "next";
import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Container, CtaSection, Eyebrow, Section, SectionHead } from "@/components/section";
import { ButtonLink } from "@/components/button";
import { Reveal, FadeIn } from "@/components/reveal";
import { HeroSystemArt, LayeredPlanesArt } from "@/components/art";
import { ServiceTicker } from "@/components/service-ticker";
import { SpectrumShowcase } from "@/components/spectrum-showcase";
import { Tag } from "@/components/tag";
import { accentHex, accents, glyphTone } from "@/lib/accents";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Technology & Cybersecurity Engineering",
  description: site.description,
  alternates: { canonical: "/" },
};

const expertise = [
  {
    title: "Software engineering",
    body: "Product and platform systems engineered for the long run — typed, tested and documented.",
  },
  {
    title: "Security",
    body: "Authorized testing, architecture review and practical controls that hold up under real use.",
  },
  {
    title: "Infrastructure",
    body: "Cloud environments designed for reliability, understood by the team that operates them.",
  },
  {
    title: "Intelligence",
    body: "Applied AI and automation where a measured improvement can actually be demonstrated.",
  },
];

const approach = [
  {
    step: "01",
    title: "Understand the problem",
    body: "Start with the constraint, the user and the cost of getting it wrong. No architecture before the problem is clear.",
  },
  {
    step: "02",
    title: "Design the right architecture",
    body: "Choose the simplest structure that meets the requirement — with the trade-offs written down, not implied.",
  },
  {
    step: "03",
    title: "Engineer reliable solutions",
    body: "Build in reviewable increments, with quality gates on the paths that carry real consequence.",
  },
  {
    step: "04",
    title: "Test and improve",
    body: "Verify behavior against the original problem, then measure what real usage reveals.",
  },
  {
    step: "05",
    title: "Build for long-term use",
    body: "Document decisions and hand over ownership, so the system outlives the engagement.",
  },
];

const approachTones = ["violet", "cyan", "lime", "amber", "rose"] as const;

const heroWords = "Engineering the next layer of technology.".split(" ");

export default function HomePage() {
  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="aurora pointer-events-none absolute inset-x-0 -top-40 hidden h-[620px] opacity-40 md:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, #141414 1px, transparent 1px)",
            backgroundSize: "calc(100% / 6) 100%",
          }}
        />
        <Container className="relative">
          <div className="grid items-center gap-12 pb-16 pt-32 md:pt-40 lg:grid-cols-12 lg:gap-8 lg:pb-24">
            <div className="lg:col-span-7 lg:pr-8">
              <FadeIn>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accents.violet }} />
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accents.cyan }} />
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accents.lime }} />
                  </span>
                  <Eyebrow marker={false}>
                    Prismelo Technology — Engineering &amp; Security
                  </Eyebrow>
                </div>
              </FadeIn>

              <FadeIn delay={0.08}>
                <h1 className="t-display mt-8 max-w-[15ch] text-white">
                  {heroWords.map((word, index) => (
                    <Fragment key={`${word}-${index}`}>
                      <span
                        className="hero-word"
                        style={{ "--i": index } as CSSProperties}
                      >
                        {word}
                      </span>
                      {index < heroWords.length - 1 ? " " : null}
                    </Fragment>
                  ))}
                </h1>
              </FadeIn>

              <FadeIn delay={0.16}>
                <p className="t-lead mt-8 max-w-[46ch]">
                  Prismelo builds secure digital systems, software experiences,
                  and intelligent infrastructure for businesses building what
                  comes next.
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="mt-8 flex flex-wrap gap-2">
                  <Tag tone="violet">Software</Tag>
                  <Tag tone="cyan">Security</Tag>
                  <Tag tone="lime">Cloud</Tag>
                  <Tag tone="amber">AI</Tag>
                </div>
              </FadeIn>

              <FadeIn delay={0.24}>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <ButtonLink href="/services" size="lg">
                    Explore Our Services
                  </ButtonLink>
                  <ButtonLink href="/contact" variant="secondary" size="lg">
                    Contact Us
                  </ButtonLink>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.2} className="lg:col-span-5">
              <div
                data-spotlight
                className="relative border border-line bg-[#040404] p-3 sm:p-4 lg:-mr-10 xl:-mr-16"
              >
                <HeroSystemArt />
                <div className="flex items-center justify-between border-t border-line px-1 pt-3">
                  <span className="t-mono text-faint">SYSTEM / 001</span>
                  <span className="t-mono text-faint">
                    SOFTWARE · SECURITY · CLOUD · AI
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>

        <div className="border-t border-line">
          <Container>
            <ul className="grid grid-cols-2 divide-x divide-line md:grid-cols-4">
              {[
                ["Penetration testing", "Authorized, scoped", accents.rose],
                ["Cybersecurity", "Architecture & risk", accents.cyan],
                ["Cloud & hosting", "Infrastructure", accents.lime],
                ["Software & AI", "Products & systems", accents.violet],
              ].map(([title, meta, color], index) => (
                <li
                  key={title}
                  className={`px-4 py-5 md:px-6 ${index > 1 ? "border-t border-line md:border-t-0" : ""} ${index === 1 ? "border-t-0" : ""}`}
                >
                  <p className="flex items-center gap-2 text-[13px] text-white">
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {title}
                  </p>
                  <p className="t-mono mt-1.5 text-faint">{meta}</p>
                </li>
              ))}
            </ul>
          </Container>
        </div>
        <ServiceTicker />
      </section>

      {/* ---------------- introduction ---------------- */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow className="mb-6">The company</Eyebrow>
                <h2 className="t-h2 max-w-[16ch] text-white">
                  Technology built with purpose.
                </h2>
                <p className="t-body mt-6 max-w-sm">
                  Prismelo works across the layers a modern business depends on
                  — the software people use, the infrastructure beneath it, and
                  the security that keeps both standing.
                </p>
              </Reveal>

              <Reveal delay={0.1} className="mt-10">
                <div className="border border-line bg-[#040404] p-5">
                  <LayeredPlanesArt />
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal>
                <p className="text-[17px] leading-relaxed text-white md:text-[19px] md:leading-[1.6]">
                  We are a technology and cybersecurity company. Our work sits
                  where engineering discipline meets operational reality:
                  systems that are secure because of how they were built, not
                  because of what was added afterwards.
                </p>
              </Reveal>

              <div className="mt-10 border-t border-line">
                {expertise.map((item, index) => (
                  <Reveal key={item.title} delay={index * 0.05}>
                    <div className="group grid grid-cols-[auto_1fr] gap-x-5 border-b border-line py-5 transition-colors hover:bg-white/[0.015]">
                      <span className="t-mono pt-1 text-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[15px] text-white">{item.title}</h3>
                        <p className="t-body mt-1.5 max-w-md text-[14px]">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.1}>
                <Link
                  href="/about"
                  className="arrow-link group mt-8 text-muted hover:text-white"
                >
                  More about Prismelo
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------- services index ---------------- */}
      <Section bordered className="bg-[#020202]">
        <Container>
          <SectionHead
            eyebrow="Services"
            title="Seven disciplines. One engineering standard."
            lead="Each engagement is scoped to the actual problem — from a single assessment to a system built end to end."
            action={{ label: "All services", href: "/services" }}
          />

          <div className="mt-14 border-t border-line md:mt-20">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={Math.min(index * 0.04, 0.2)}>
                <Link
                  href={`/services/${service.slug}`}
                  data-spotlight
                  style={
                    { "--spot": accentHex(glyphTone[service.glyph]) } as CSSProperties
                  }
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 gap-y-2 border-b border-line py-6 transition-colors hover:bg-white/[0.02] md:grid-cols-12 md:items-baseline md:gap-6 md:px-4 md:py-7"
                >
                  <span className="t-mono pt-1.5 text-faint md:col-span-1 md:pt-0">
                    {service.index}
                  </span>
                  <div className="md:col-span-4">
                    <h3 className="text-[19px] tracking-[-0.02em] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:text-[22px] md:group-hover:translate-x-1">
                      {service.name}
                    </h3>
                    <Tag
                      tone={glyphTone[service.glyph]}
                      className="mt-3 hidden md:inline-flex"
                    >
                      {service.eyebrow.replace("Service — ", "")}
                    </Tag>
                  </div>
                  <p className="col-span-2 max-w-md text-[13.5px] leading-relaxed text-muted md:col-span-6 md:col-start-6">
                    {service.summary}
                  </p>
                  <span className="col-start-3 row-start-1 justify-self-end md:col-span-1 md:col-start-12">
                    <ArrowUpRight
                      className="h-4 w-4 transition-all duration-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      style={{ color: accentHex(glyphTone[service.glyph]) }}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------- capability spectrum ---------------- */}
      <Section bordered className="relative overflow-hidden bg-[#020202]">
        <div
          aria-hidden="true"
          className="aurora pointer-events-none absolute inset-x-0 top-1/4 hidden h-[520px] opacity-25 md:block"
        />
        <Container className="relative">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <Eyebrow className="mb-6">Capability spectrum</Eyebrow>
              <h2 className="t-h2 max-w-xl text-white">
                One prism. Seven disciplines.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pt-2">
              <p className="t-body max-w-md">
                Every engagement starts as one problem. Hover a discipline to
                see how it splits into a specific body of work.
              </p>
            </div>
          </div>

          <div className="mt-12 md:mt-16">
            <SpectrumShowcase />
          </div>
        </Container>
      </Section>

      {/* ---------------- companies ---------------- */}
      <Section bordered>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow className="mb-6">Companies</Eyebrow>
                <h2 className="t-h2 max-w-[14ch] text-white">
                  One company. Independent products.
                </h2>
                <p className="t-body mt-6 max-w-sm">
                  Prismelo builds and operates its own technology companies
                  alongside client work. Each product has its own product team,
                  identity and direction.
                </p>
                <Link
                  href="/companies"
                  className="arrow-link group mt-8 text-muted hover:text-white"
                >
                  The Prismelo group
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              {site.ownedCompanies.map((company) => (
                <Reveal key={company.name} delay={0.08}>
                  <div
                    data-spotlight
                    className="group relative border border-line bg-[#080808] p-6 transition-colors hover:border-[#3a3a3a] md:p-8"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="t-label text-faint">{company.relationship}</p>
                        <h3 className="mt-4 text-[26px] tracking-[-0.03em] text-white md:text-[32px]">
                          {company.name}
                        </h3>
                      </div>
                      <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
                        <span
                          className="pulse-dot h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: accents.lime, boxShadow: `0 0 10px ${accents.lime}` }}
                        />
                        <span className="t-mono" style={{ color: accents.lime }}>
                          {company.status}
                        </span>
                      </span>
                    </div>

                    <p className="t-body mt-4 max-w-md text-[14px]">
                      {company.summary}
                    </p>

                    <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6">
                      <div>
                        <dt className="t-label text-faint">Industry</dt>
                        <dd className="mt-2 text-[13.5px] text-white">
                          {company.industry}
                        </dd>
                      </div>
                      <div>
                        <dt className="t-label text-faint">Website</dt>
                        <dd className="mt-2">
                          <a
                            href={company.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[13.5px] text-white underline decoration-[#3f3f3f] underline-offset-4 transition-colors hover:decoration-white"
                          >
                            hirenextai.com
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </Reveal>
              ))}

              <Reveal delay={0.12}>
                <div className="mt-3 flex items-center justify-between border border-dashed border-[#232323] px-6 py-5">
                  <p className="text-[13px] text-faint">
                    Additional companies will be listed here as they launch.
                  </p>
                  <Link
                    href="/companies"
                    className="t-mono hidden text-faint transition-colors hover:text-white sm:block"
                  >
                    STRUCTURE →
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------- approach ---------------- */}
      <Section bordered className="bg-[#020202]">
        <Container>
          <SectionHead
            eyebrow="Approach"
            title="How the work actually runs."
            lead="A consistent method across every discipline. It is deliberately unglamorous — that is what makes it repeatable."
          />

          <div className="mt-14 grid gap-x-8 gap-y-10 md:mt-20 md:grid-cols-2 lg:grid-cols-5">
            {approach.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.06}>
                <div
                  className="approach-step border-t border-line pt-5"
                  style={
                    {
                      "--step-color": accentHex(approachTones[index]),
                      "--step-delay": `${index * 0.55}s`,
                    } as CSSProperties
                  }
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="t-mono"
                      style={{ color: accentHex(approachTones[index]) }}
                    >
                      {item.step}
                    </span>
                    {index < approach.length - 1 ? (
                      <ArrowRight
                        className="approach-arrow hidden h-3.5 w-3.5 text-[#2f2f2f] lg:block"
                        aria-hidden="true"
                      />
                    ) : (
                      <Check
                        className="approach-check hidden h-3.5 w-3.5 text-[#3d3d3d] lg:block"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <h3 className="mt-6 text-[15px] leading-snug text-white">
                    {item.title}
                  </h3>
                  <p className="t-body mt-3 text-[13.5px]">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
