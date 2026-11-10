import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import {
  Container,
  CtaSection,
  Eyebrow,
  Section,
  SectionHead,
} from "@/components/section";
import { Reveal, FadeIn } from "@/components/reveal";
import { ServiceGlyph } from "@/components/art";
import { ButtonLink } from "@/components/button";
import { FaqList } from "@/components/faq";
import { Tag } from "@/components/tag";
import { accentHex, glyphTone } from "@/lib/accents";
import { getService, relatedServices, services } from "@/lib/services";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.name,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} — Prismelo Technology`,
      description: service.summary,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = relatedServices(service.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.summary,
    provider: {
      "@type": "Organization",
      name: "Prismelo Technology",
      url: "https://prismelo.tech",
    },
    areaServed: "Worldwide",
    serviceType: service.name,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* hero */}
      <header className="relative border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden opacity-60 lg:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, #161616 1px, transparent 1px)",
            backgroundSize: "25% 100%",
          }}
        />
        <Container className="relative pt-28 md:pt-36">
          <Reveal y={8}>
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-faint">
              <Link href="/services" className="transition-colors hover:text-white">
                Services
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-muted">{service.name}</span>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-12 pb-14 md:mt-14 lg:grid-cols-12 lg:gap-10 lg:pb-20">
            <div className="lg:col-span-7">
              <Reveal y={12}>
                <Tag tone={glyphTone[service.glyph]}>
                  {service.index} — {service.eyebrow.replace("Service — ", "")}
                </Tag>
                <h1 className="t-h1 mt-6 max-w-[18ch] text-white">
                  {service.title}
                </h1>
                <p className="t-lead mt-7 max-w-lg">{service.lead}</p>
              </Reveal>

              <FadeIn delay={0.2}>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <ButtonLink href="/contact" size="lg">
                    Discuss this service
                  </ButtonLink>
                  <ButtonLink
                    href="/services"
                    variant="secondary"
                    size="lg"
                    className="gap-2"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    All services
                  </ButtonLink>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.14} className="lg:col-span-4 lg:col-start-9">
              <div className="relative overflow-hidden border border-line bg-[#040404] p-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl"
                  style={{ backgroundColor: accentHex(glyphTone[service.glyph]) }}
                />
                <ServiceGlyph glyph={service.glyph} />
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="t-mono text-faint">SERVICE / {service.index}</span>
                  <span className="t-mono text-faint">PRISMELO</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="grid border-t border-line sm:grid-cols-3">
            {service.meta.map((item, index) => (
              <div
                key={item.label}
                className={`py-5 sm:px-6 ${index > 0 ? "border-t border-line sm:border-l sm:border-t-0" : "sm:pl-0"}`}
              >
                <p
                  className="t-label"
                  style={{ color: accentHex(glyphTone[service.glyph]) }}
                >
                  {item.label}
                </p>
                <p className="mt-2 text-[13.5px] text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </Container>
      </header>

      {/* notice */}
      {service.notice ? (
        <Container>
          <Reveal>
            <div className="mt-10 flex flex-col gap-2 border border-line border-l-white/60 bg-[#070707] px-5 py-4 md:flex-row md:items-center md:gap-6">
              <span className="t-label shrink-0 text-white">Note</span>
              <p className="text-[13px] leading-relaxed text-muted">
                {service.notice}
              </p>
            </div>
          </Reveal>
        </Container>
      ) : null}

      {/* introduction */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <Reveal>
                <Eyebrow className="mb-6">Overview</Eyebrow>
                <h2 className="t-h2 max-w-[16ch] text-white">
                  {service.intro.heading}
                </h2>
              </Reveal>
              <div className="mt-7 flex max-w-xl flex-col gap-5">
                {service.intro.paragraphs.map((paragraph, index) => (
                  <Reveal key={index} delay={0.05 * index}>
                    <p className="t-body">{paragraph}</p>
                  </Reveal>
                ))}
              </div>
            </div>

            {service.intro.points ? (
              <div className="lg:col-span-5 lg:col-start-8">
                <div className="flex flex-col gap-3">
                  {service.intro.points.map((point, index) => (
                    <Reveal key={point.title} delay={0.08 + index * 0.06}>
                      <div className="border border-line bg-[#060606] p-6">
                        <p className="t-mono text-faint">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-4 text-[15px] text-white">
                          {point.title}
                        </h3>
                        <p className="t-body mt-2 text-[13.5px]">{point.body}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* capabilities */}
      <Section bordered className="bg-[#020202]">
        <Container>
          <SectionHead
            eyebrow="Capabilities"
            title="What this engagement covers."
            lead="Scope is agreed per project. The list below is the typical surface area, not a fixed package."
          />

          <div className="mt-14 grid border-l border-t border-line md:mt-16 md:grid-cols-2 lg:grid-cols-3">
            {service.capabilities.map((capability, index) => (
              <Reveal key={capability.title} delay={Math.min(index * 0.04, 0.16)}>
                <div className="group h-full border-b border-r border-line p-6 transition-colors hover:bg-white/[0.02] md:p-7">
                  <div className="flex items-baseline justify-between">
                    <span className="t-mono text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-[5px] w-[5px] bg-[#2f2f2f] transition-colors group-hover:bg-white"
                    />
                  </div>
                  <h3 className="mt-8 text-[15.5px] leading-snug text-white">
                    {capability.title}
                  </h3>
                  <p className="t-body mt-2.5 text-[13.5px]">
                    {capability.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* process */}
      <Section bordered>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <Reveal>
                  <Eyebrow className="mb-6">Process</Eyebrow>
                  <h2 className="t-h2 max-w-[12ch] text-white">
                    How the engagement runs.
                  </h2>
                  <p className="t-body mt-6 max-w-xs">
                    A sequence that keeps scope honest and progress visible from
                    the first week.
                  </p>
                </Reveal>
              </div>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              <ol className="relative">
                {service.process.map((step, index) => (
                  <Reveal key={step.title} delay={Math.min(index * 0.05, 0.2)}>
                    <li className="relative grid grid-cols-[auto_1fr] gap-6 border-t border-line py-7 last:border-b">
                      <span className="t-mono pt-1 text-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[16px] text-white">{step.title}</h3>
                        <p className="t-body mt-2 max-w-md text-[13.5px]">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      {/* deliverables + faq */}
      <Section bordered className="bg-[#020202]">
        <Container>
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow className="mb-6">Deliverables</Eyebrow>
                <h2 className="t-h2 max-w-[14ch] text-white">
                  What you receive.
                </h2>
                <p className="t-body mt-6 max-w-sm">
                  Everything is written for the people who will use it — your
                  engineers, your leadership and whoever operates the system
                  afterwards.
                </p>
              </Reveal>

              <ul className="mt-9 flex flex-col">
                {service.deliverables.map((item, index) => (
                  <Reveal key={item} delay={Math.min(index * 0.04, 0.15)}>
                    <li className="flex items-start gap-3 border-t border-line py-4 last:border-b">
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/70"
                        aria-hidden="true"
                      />
                      <span className="text-[13.5px] leading-relaxed text-muted">
                        {item}
                      </span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal>
                <Eyebrow className="mb-6">FAQ</Eyebrow>
                <h2 className="t-h2 max-w-[16ch] text-white">
                  Questions worth asking.
                </h2>
              </Reveal>
              <div className="mt-9">
                <FaqList items={service.faqs} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* related */}
      <Section bordered>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <Eyebrow className="mb-5">Related</Eyebrow>
              <h2 className="text-[24px] tracking-[-0.03em] text-white md:text-[28px]">
                Often engaged together.
              </h2>
            </Reveal>
            <Link
              href="/services"
              className="arrow-link group text-muted hover:text-white"
            >
              All services
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid border-t border-line md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/services/${item.slug}`}
                className="group flex flex-col justify-between gap-8 border-b border-line py-7 transition-colors hover:bg-white/[0.02] md:border-r md:px-6 md:last:border-r-0"
              >
                <div>
                  <p className="t-mono text-faint">{item.index}</p>
                  <h3 className="mt-4 text-[18px] text-white">{item.name}</h3>
                  <p className="t-body mt-2 text-[13px]">{item.summary}</p>
                </div>
                <ArrowUpRight
                  className="h-4 w-4 text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <CtaSection
        title="Have a scope in mind?"
        text={`Tell us what you are working on and we will tell you honestly whether ${service.name.toLowerCase()} is the right starting point.`}
      />
    </>
  );
}
