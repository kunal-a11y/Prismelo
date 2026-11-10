import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button";
import { HeroBeamArt } from "@/components/art";
import { accentHex, type Tone } from "@/lib/accents";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("page-shell", className)}>{children}</div>;
}

export function Eyebrow({
  children,
  className,
  marker = true,
  tone = "violet",
}: {
  children: ReactNode;
  className?: string;
  marker?: boolean;
  tone?: Tone;
}) {
  return (
    <p className={cn("t-label flex items-center gap-2.5", className)}>
      {marker ? (
        <span
          aria-hidden="true"
          className="pulse-dot h-[5px] w-[5px] rounded-full"
          style={{
            backgroundColor: accentHex(tone),
            boxShadow: `0 0 10px ${accentHex(tone)}`,
          }}
        />
      ) : null}
      {children}
    </p>
  );
}

export function Section({
  children,
  className,
  id,
  bordered = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 md:py-28",
        bordered && "border-t border-line",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  action,
  className,
  align = "split",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: { label: string; href: string };
  className?: string;
  align?: "split" | "stack";
}) {
  return (
    <Reveal>
      <div
        className={cn(
          "grid gap-8 lg:grid-cols-12 lg:gap-10",
          align === "stack" && "lg:grid-cols-1",
          className,
        )}
      >
        <div className={cn("lg:col-span-7", align === "stack" && "lg:col-span-1")}>
          {eyebrow ? <Eyebrow className="mb-6">{eyebrow}</Eyebrow> : null}
          <h2 className="t-h2 max-w-2xl text-white">{title}</h2>
        </div>
        {(lead || action) && (
          <div
            className={cn(
              "flex flex-col items-start gap-6 lg:col-span-5 lg:pt-1",
              align === "stack" && "lg:col-span-1",
            )}
          >
            {lead ? <p className="t-body max-w-md">{lead}</p> : null}
            {action ? (
              <Link
                href={action.href}
                className="arrow-link group text-muted hover:text-white"
              >
                {action.label}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </Reveal>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="relative border-b border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #161616 1px, transparent 1px)",
          backgroundSize: "25% 100%",
        }}
      />
      <Container className="relative pt-32 pb-14 md:pt-40 md:pb-20">
        <Reveal y={12}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h1 className="t-h1 max-w-3xl text-white">{title}</h1>
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-5">
            {aside ?? (lead ? <p className="t-lead max-w-md lg:pt-2">{lead}</p> : null)}
          </Reveal>
        </div>
        {children ? <div className="mt-12 md:mt-16">{children}</div> : null}
      </Container>
    </header>
  );
}

export function CtaSection({
  title = "Have something worth building?",
  text = "Let's discuss your next technology project.",
  primary = { label: "Start a Conversation", href: "/contact" },
  secondary,
}: {
  title?: string;
  text?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden border-t border-line">
      <div
        aria-hidden="true"
        className="aurora pointer-events-none absolute inset-x-0 top-0 hidden h-[420px] opacity-30 md:block"
      />
      <div
        aria-hidden="true"
        className="prism-beam pointer-events-none absolute bottom-0 right-0 hidden h-[240px] w-[520px] lg:block"
      >
        <HeroBeamArt className="h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 h-[460px] w-[460px] md:-top-56 md:right-10"
      >
        <svg viewBox="0 0 400 400" fill="none" className="h-full w-full">
          <defs>
            <linearGradient id="cta-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b7bff" stopOpacity="0.8" />
              <stop offset="55%" stopColor="#3fd8e6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c3f24f" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="200" r="199" stroke="#1c1c1c" />
          <circle cx="200" cy="200" r="150" stroke="#181818" />
          <circle cx="200" cy="200" r="100" stroke="#141414" />
          <circle
            cx="200"
            cy="200"
            r="199"
            stroke="url(#cta-ring)"
            strokeDasharray="1 18"
            strokeLinecap="round"
            className="animate-orbit"
            style={{ transformOrigin: "200px 200px" }}
          />
        </svg>
      </div>
      <Container className="relative py-24 md:py-32">
        <Reveal>
          <div className="max-w-3xl">
            <h2 className="t-h2 text-white">{title}</h2>
            <p className="t-lead mt-5 max-w-lg">{text}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ButtonLink href={primary.href} size="lg">
                {primary.label}
              </ButtonLink>
              {secondary ? (
                <ButtonLink href={secondary.href} variant="secondary" size="lg">
                  {secondary.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
