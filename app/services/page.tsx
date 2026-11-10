import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, Container, Section, CtaSection, Eyebrow } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { ServiceGlyph } from "@/components/art";
import { Tag } from "@/components/tag";
import { accentHex, accents, glyphTone } from "@/lib/accents";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Security testing, cloud infrastructure, software engineering, AI, IT consulting and web development — delivered as one engineering standard.",
  alternates: { canonical: "/services" },
};

const engagementModels = [
  {
    label: "Advisory",
    title: "Decide with evidence",
    body: "Architecture reviews, risk assessments and technology strategy, delivered as a written assessment your team can act on.",
    services: ["IT Consulting", "Cybersecurity Consulting"],
  },
  {
    label: "Assurance",
    title: "Verify what is exposed",
    body: "Authorized, scoped security testing with validated findings and remediation guidance — not a scanner dump.",
    services: ["Penetration Testing"],
  },
  {
    label: "Build",
    title: "Ship something durable",
    body: "Software, web platforms, AI features and the infrastructure they run on, engineered for maintenance after launch.",
    services: ["Software Development", "Web Development", "AI Solutions", "Cloud & Hosting"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Engineering, security and infrastructure treated as one discipline."
        lead="Prismelo works across the layers a business depends on. Each service stands alone, but the standard behind them is the same: understand the problem, document the decision, build it to last."
      >
        <div className="grid gap-y-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Disciplines", "07"],
            ["Engagement types", "Advisory · Assurance · Build"],
            ["Delivery", "Scoped, incremental"],
            ["Authorization", "Required for testing"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="t-label text-faint">{label}</p>
              <p className="mt-2 text-[13.5px] text-white">{value}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <Section>
        <Container>
          <div className="border-t border-line">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={Math.min(index * 0.03, 0.15)}>
                <article
                  data-spotlight
                  style={{ "--spot": accentHex(glyphTone[service.glyph]) } as CSSProperties}
                  className="group relative grid gap-6 border-b border-line py-9 transition-colors hover:bg-white/[0.015] md:py-11 lg:grid-cols-12 lg:items-center lg:gap-8"
                >
                  <div className="flex items-center gap-5 lg:col-span-1 lg:block">
                    <span className="t-mono text-faint">{service.index}</span>
                    <Tag tone={glyphTone[service.glyph]} className="lg:hidden">
                      {service.eyebrow.replace("Service — ", "")}
                    </Tag>
                  </div>

                  <div className="lg:col-span-4">
                    <h2 className="text-[24px] leading-tight tracking-[-0.03em] text-white md:text-[30px]">
                      <Link
                        href={`/services/${service.slug}`}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {service.name}
                      </Link>
                    </h2>
                    <Tag tone={glyphTone[service.glyph]} className="mt-4 hidden lg:inline-flex">
                      {service.eyebrow.replace("Service — ", "")}
                    </Tag>
                  </div>

                  <div className="lg:col-span-4 lg:col-start-6">
                    <p className="max-w-md text-[13.5px] leading-relaxed text-muted">
                      {service.summary}
                    </p>
                    <p className="t-mono mt-4 text-faint">
                      {service.capabilities
                        .slice(0, 3)
                        .map((capability) => capability.title)
                        .join("  ·  ")}
                    </p>
                  </div>

                  <div className="hidden lg:col-span-2 lg:col-start-11 lg:block">
                    <ServiceGlyph
                      glyph={service.glyph}
                      className="h-24 w-24 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </div>

                  <div className="hidden justify-self-end lg:col-span-1 lg:col-start-12 lg:block">
                    <ArrowUpRight
                      className="h-4 w-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      style={{ color: accentHex(glyphTone[service.glyph]) }}
                      aria-hidden="true"
                    />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section bordered className="bg-[#020202]">
        <Container>
          <Reveal>
            <Eyebrow className="mb-6">Engagement models</Eyebrow>
            <h2 className="t-h2 max-w-xl text-white">
              Three ways to work with us.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
            {engagementModels.map((model, index) => (
              <Reveal key={model.label} delay={index * 0.07}>
                <div className="border-t border-line pt-6">
                  <p
                    className="t-mono"
                    style={{ color: accentHex((["violet", "amber", "lime"] as const)[index]) }}
                  >
                    {model.label.toUpperCase()}
                  </p>
                  <h3 className="mt-5 text-[18px] leading-snug text-white">
                    {model.title}
                  </h3>
                  <p className="t-body mt-3 text-[13.5px]">{model.body}</p>
                  <ul className="mt-6 flex flex-col gap-2">
                    {model.services.map((name) => (
                      <li key={name} className="flex items-center gap-2.5">
                        <span
                          className="h-[1px] w-3"
                          style={{ backgroundColor: accents[("violet")] }}
                        />
                        <span className="text-[12.5px] text-muted">{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CtaSection
        title="Not sure which service you need?"
        text="Describe the problem and we will tell you what it actually requires — including when the answer is to change very little."
        secondary={{ label: "Read the documentation", href: "/docs" }}
      />
    </>
  );
}
