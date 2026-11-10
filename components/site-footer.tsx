import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { SocialLinks } from "@/components/social-links";
import { footerColumns, site } from "@/lib/site";
import { Container } from "@/components/section";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-black">
      <Container className="py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-muted">
              A technology and cybersecurity company building secure software,
              cloud infrastructure and intelligent systems.
            </p>
            <a
              href={`mailto:${site.contactEmail}`}
              className="u-link mt-5 inline-block text-[13.5px] text-white"
            >
              {site.contactEmail}
            </a>
            <SocialLinks className="mt-6" />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-8">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="t-label mb-5 text-faint">{column.title}</h2>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-muted transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-mono text-faint">
            © {year} {site.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {site.ownedCompanies.map((company) => (
              <a
                key={company.name}
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-white"
              >
                {company.name}
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            ))}
            <Link
              href="/privacy"
              className="text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
