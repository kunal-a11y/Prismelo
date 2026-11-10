"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Cloud,
  Code2,
  Compass,
  Globe,
  Menu,
  MessagesSquare,
  Newspaper,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { navLinks, resourcesNav, servicesNav, site } from "@/lib/site";
import { accents } from "@/lib/accents";
import { ScrollProgress } from "@/components/scroll-progress";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Line icon and accent per dropdown entry, so each option reads at a glance. */
const menuIcons: Record<string, { Icon: LucideIcon; color: string }> = {
  "/services/penetration-testing": { Icon: ShieldCheck, color: accents.rose },
  "/services/cybersecurity-consulting": { Icon: Shield, color: accents.violet },
  "/services/cloud-hosting": { Icon: Cloud, color: accents.lime },
  "/services/software-development": { Icon: Code2, color: accents.violet },
  "/services/ai-solutions": { Icon: Sparkles, color: accents.amber },
  "/services/web-development": { Icon: Globe, color: accents.cyan },
  "/services/it-consulting": { Icon: Compass, color: accents.cyan },
  "/docs": { Icon: BookOpen, color: accents.cyan },
  "/community": { Icon: MessagesSquare, color: accents.lime },
  "/resources": { Icon: Newspaper, color: accents.violet },
};

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // `openMenu` is pinned by click/tap; `hoveredMenu` follows the pointer.
  // Keeping them separate means hovering does not make a click close the menu.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setHoveredMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setHoveredMenu(null);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
        setHoveredMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const isActive = useCallback(
    (href: string) =>
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  const isOpen = useCallback(
    (label: string) => openMenu === label || hoveredMenu === label,
    [openMenu, hoveredMenu],
  );

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || openMenu || mobileOpen
            ? "border-b border-line bg-black/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="page-shell">
          <div className="flex h-16 items-center justify-between gap-6 md:h-[72px]">
            <Logo />

            <nav
              aria-label="Primary"
              className="hidden items-center gap-0.5 lg:flex"
            >
              {navLinks.map((group) =>
                group.children ? (
                  <div
                    key={group.label}
                    className="relative"
                    onMouseEnter={() => {
                      setHoveredMenu(group.label);
                      setOpenMenu(null);
                    }}
                    onMouseLeave={() => setHoveredMenu(null)}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen(group.label)}
                      aria-haspopup="true"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === group.label ? null : group.label,
                        )
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] transition-colors",
                        isActive(group.href ?? "")
                          ? "text-white"
                          : "text-muted hover:text-white",
                      )}
                    >
                      {group.label}
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform duration-300",
                          isOpen(group.label) && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen(group.label) ? (
                      <div className="menu-panel absolute left-0 top-full pt-3">
                          <div
                            className={cn(
                              "overflow-hidden rounded-lg border border-line bg-[#050505] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)]",
                              group.label === "Services"
                                ? "w-[560px]"
                                : "w-[320px]",
                            )}
                          >
                            <ul
                              className={cn(
                                "p-2",
                                group.label === "Services" &&
                                  "grid grid-cols-2 gap-0.5",
                              )}
                            >
                              {(group.children ?? []).map((child) => {
                                const entry = menuIcons[child.href];
                                const ItemIcon = entry?.Icon;
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={() => {
                                        setOpenMenu(null);
                                        setHoveredMenu(null);
                                      }}
                                      className="group/item flex flex-col gap-0.5 rounded-md px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                                    >
                                      <span className="flex items-center gap-2.5 text-[13px] text-white">
                                        {ItemIcon ? (
                                          <ItemIcon
                                            className="nav-menu-icon h-4 w-4 shrink-0"
                                            style={{ color: entry.color }}
                                            aria-hidden="true"
                                          />
                                        ) : null}
                                        {child.label}
                                        <ArrowUpRight
                                          className="ml-auto h-3 w-3 text-faint opacity-0 transition-all duration-300 group-hover/item:opacity-100"
                                          aria-hidden="true"
                                        />
                                      </span>
                                      <span
                                        className={cn(
                                          "text-[11.5px] leading-relaxed text-faint",
                                          entry ? "pl-[26px]" : "",
                                        )}
                                      >
                                        {child.description}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                            {group.label === "Services" ? (
                              <Link
                                href="/services"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setHoveredMenu(null);
                                }}
                                className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:bg-white/[0.03] hover:text-white"
                              >
                                All services
                                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                              </Link>
                            ) : null}
                          </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    key={group.label}
                    href={group.href!}
                    className={cn(
                      "rounded-full px-3 py-2 text-[13px] transition-colors",
                      isActive(group.href!)
                        ? "text-white"
                        : "text-muted hover:text-white",
                    )}
                  >
                    {group.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className="hidden h-9 items-center rounded-full bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-[#e2e2e2] sm:inline-flex"
              >
                Contact
              </Link>
              <button
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-white transition-colors hover:border-white/40 lg:hidden"
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Menu className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        <ScrollProgress />
      </header>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          className="mobile-menu fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-black pt-16 lg:hidden"
        >
            <nav
              aria-label="Mobile"
              className="page-shell flex min-h-full flex-col pb-10 pt-6"
            >
              <div className="flex flex-col">
                {navLinks.map((group, index) => (
                  <div
                    key={group.label}
                    className="mobile-menu__item border-b border-line"
                    style={{ animationDelay: `${0.04 * index}s` }}
                  >
                    {group.children ? (
                      <div className="py-5">
                        <p className="t-label mb-4 text-faint">{group.label}</p>
                        <ul className="flex flex-col gap-1">
                          {group.children.map((child) => {
                            const entry = menuIcons[child.href];
                            const ItemIcon = entry?.Icon;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className="flex items-center gap-3 py-2 text-[17px] tracking-[-0.01em] text-white"
                                >
                                  {ItemIcon ? (
                                    <ItemIcon
                                      className="h-4 w-4 shrink-0"
                                      style={{ color: entry.color }}
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                  {child.label}
                                  <ArrowUpRight
                                    className="ml-auto h-3.5 w-3.5 text-faint"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </li>
                            );
                          })}
                          <li className="pt-2">
                            <Link
                              href={group.href ?? group.children[0].href}
                              className="t-mono text-faint"
                            >
                              View all →
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <Link
                        href={group.href!}
                        className="flex items-center justify-between py-5 text-[22px] tracking-[-0.02em] text-white"
                      >
                        {group.label}
                        <ArrowUpRight
                          className="h-4 w-4 text-faint"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                  </div>
                ))}

                <div
                  className="mobile-menu__item mt-auto pt-10"
                  style={{ animationDelay: "0.24s" }}
                >
                  <Link
                    href="/contact"
                    className="flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-medium text-black"
                  >
                    Start a conversation
                  </Link>
                  <div className="mt-6 flex flex-col gap-1">
                    <a
                      href={`mailto:${site.contactEmail}`}
                      className="t-mono text-muted"
                    >
                      {site.contactEmail}
                    </a>
                    <span className="t-mono text-faint">
                      Technology &amp; security engineering
                    </span>
                  </div>
                </div>
              </div>
            </nav>
        </div>
      ) : null}
    </>
  );
}

export { servicesNav, resourcesNav };
