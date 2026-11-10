import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Container,
  CtaSection,
  Eyebrow,
  PageHeader,
  Section,
  SectionHead,
} from "@/components/section";
import { Reveal } from "@/components/reveal";
import { ProcessAxisArt } from "@/components/art";
import { TextLink } from "@/components/button";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Prismelo is a technology and cybersecurity company building secure software, cloud infrastructure and intelligent systems. Mission, vision and engineering philosophy.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    title: "Clarity before complexity",
    body: "The simplest structure that meets the requirement is almost always the one that survives. Complexity is added only when it buys something specific.",
  },
  {
    title: "Security as a property",
    body: "Security is a property of how a system is designed, built and operated — not a review that happens at the end.",
  },
  {
    title: "Evidence over assertion",
    body: "Claims about performance, reliability or accuracy should be measurable. Where something is not yet proven, we say so.",
  },
  {
    title: "Ownership after handover",
    body: "Work is finished when your team can operate, extend and explain it without us in the room.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A technology company built around how systems actually behave."
        lead="Prismelo works where software, security and infrastructure meet. We design and build systems for organisations that need them to keep working long after launch."
      >
        <div className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
          <div>
            <p className="t-label text-faint">Nature of the company</p>
            <p className="mt-2 text-[13.5px] text-white">
              Technology &amp; cybersecurity
            </p>
          </div>
          <div>
            <p className="t-label text-faint">Founder</p>
            <p className="mt-2 text-[13.5px] text-white">{site.founder}</p>
          </div>
          <div>
            <p className="t-label text-faint">Group</p>
            <p className="mt-2 text-[13.5px] text-white">
              Prismelo · HirenextAI
            </p>
          </div>
        </div>
      </PageHeader>

      {/* what we are */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-3">
              <Reveal>
                <Eyebrow>What Prismelo is</Eyebrow>
              </Reveal>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal>
                <p className="text-[22px] leading-[1.45] tracking-[-0.02em] text-white md:text-[27px]">
                  We are an engineering company first. The security work, the
                  infrastructure work and the product work all come from the same
                  discipline: understanding a system well enough to change it
                  without breaking it.
                </p>
              </Reveal>
              <div className="mt-9 grid gap-6 md:grid-cols-2">
                <Reveal delay={0.06}>
                  <p className="t-body">
                    Prismelo builds and operates technology for businesses that
                    depend on it. That includes client systems — applications,
                    platforms, cloud environments — and products of our own, like
                    HirenextAI.
                  </p>
                </Reveal>
                <Reveal delay={0.12}>
                  <p className="t-body">
                    We keep the range deliberately connected. A security finding
                    changes how an application is built. A hosting decision
                    changes what security controls are realistic. Treating those
                    as separate purchases produces systems that never quite fit
                    together.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* mission / vision */}
      <Section bordered className="bg-[#020202]">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 md:gap-0">
            <Reveal>
              <div className="md:pr-12">
                <div className="flex items-baseline gap-4 border-t border-line pt-6">
                  <span className="t-mono text-faint">01</span>
                  <p className="t-label text-white">Mission</p>
                </div>
                <h2 className="t-h3 mt-8 max-w-md text-white">
                  Build technology that is secure, understandable and worth
                  maintaining.
                </h2>
                <p className="t-body mt-5 max-w-md">
                  Every engagement should leave a system that is stronger than it
                  was — better documented, better defended, and easier for the
                  next engineer to work with.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="md:border-l md:border-line md:pl-12">
                <div className="flex items-baseline gap-4 border-t border-line pt-6 md:border-t-0 md:pt-6">
                  <span className="t-mono text-faint">02</span>
                  <p className="t-label text-white">Vision</p>
                </div>
                <h2 className="t-h3 mt-8 max-w-md text-white">
                  A small group of technology companies, each with a clear
                  product and a shared standard.
                </h2>
                <p className="t-body mt-5 max-w-md">
                  Prismelo is built to hold more than one company. The long-term
                  direction is a portfolio of products that stand on their own,
                  supported by the same engineering practice.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* philosophy */}
      <Section bordered>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <Reveal>
                  <Eyebrow className="mb-6">Engineering philosophy</Eyebrow>
                  <h2 className="t-h2 max-w-[13ch] text-white">
                    Four rules we do not bend.
                  </h2>
                </Reveal>
                <Reveal delay={0.1} className="mt-10 hidden w-48 lg:block">
                  <ProcessAxisArt />
                </Reveal>
              </div>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              <div className="border-t border-line">
                {principles.map((principle, index) => (
                  <Reveal key={principle.title} delay={index * 0.05}>
                    <div className="grid grid-cols-[auto_1fr] gap-6 border-b border-line py-7">
                      <span className="t-mono pt-1 text-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[17px] text-white">
                          {principle.title}
                        </h3>
                        <p className="t-body mt-2 max-w-lg text-[14px]">
                          {principle.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* expertise */}
      <Section bordered className="bg-[#020202]">
        <Container>
          <SectionHead
            eyebrow="Areas of expertise"
            title="Where the work concentrates."
            lead="Seven service areas, one engineering practice. Most engagements draw on more than one."
          />

          <div className="mt-14 grid gap-x-10 border-t border-line md:mt-16 md:grid-cols-2">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={Math.min(index * 0.04, 0.16)}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex items-start gap-5 border-b border-line py-5"
                >
                  <span className="t-mono pt-1.5 text-faint">{service.index}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-[15px] text-white">{service.name}</h3>
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 text-[#3a3a3a] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="t-body mt-1.5 max-w-sm text-[13px]">
                      {service.summary}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* long term */}
      <Section bordered>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow className="mb-6">Long-term direction</Eyebrow>
                <h2 className="t-h2 max-w-[15ch] text-white">
                  Built to compound, not to scale for its own sake.
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal delay={0.08}>
                <p className="t-body text-[15px]">
                  The company grows by building things it can stand behind:
                  products with real users, systems with real operators, and
                  documentation that outlives the engagement. We would rather add
                  one durable company than announce five.
                </p>
                <p className="t-body mt-5 text-[15px]">
                  That also means being restrained about what we claim. There are
                  no invented case studies here, no borrowed credentials and no
                  fabricated statistics — if a detail is not confirmed, it is not
                  on this website.
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
                  <TextLink href="/companies">The company group</TextLink>
                  <TextLink href="/founder">Founder profile</TextLink>
                  <TextLink href="/docs">Documentation</TextLink>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
