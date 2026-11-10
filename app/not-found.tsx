import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/section";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, #141414 1px, transparent 1px)",
          backgroundSize: "calc(100% / 6) 100%",
        }}
      />
      <Container className="relative flex min-h-[78vh] flex-col justify-center py-32">
        <p className="t-mono text-faint">ERROR / 404</p>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h1 className="t-display max-w-[16ch] text-white">
              This page does not exist.
            </h1>
            <p className="t-lead mt-7 max-w-md">
              The address may have changed, or it may never have pointed at
              anything. Nothing is broken — there is simply no page here.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13.5px] font-medium text-black transition-colors hover:bg-[#e2e2e2]"
          >
            Back to home
          </Link>
          <Link
            href="/services"
            className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[13.5px] text-white transition-colors hover:border-white/40"
          >
            Services
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[13.5px] text-white transition-colors hover:border-white/40"
          >
            Documentation
          </Link>
        </div>

        <div className="mt-16 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
          {[
            { label: "Contact", href: "/contact" },
            { label: "Community", href: "/community" },
            { label: "Resources", href: "/resources" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between text-[13px] text-muted transition-colors hover:text-white"
            >
              {item.label}
              <ArrowUpRight
                className="h-3.5 w-3.5 text-[#3a3a3a] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
