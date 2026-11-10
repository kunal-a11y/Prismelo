"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { accents } from "@/lib/accents";

export type DocsNavGroup = {
  title: string;
  items: { title: string; href: string }[];
};

export function DocsNavTree({
  groups,
  onNavigate,
}: {
  groups: DocsNavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-7">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="t-label mb-3 text-faint">{group.title}</p>
          <ul className="border-l border-line">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    style={active ? { borderLeftColor: accents.violet } : undefined}
                    className={cn(
                      "-ml-px block border-l py-1.5 pl-3.5 text-[13px] leading-snug transition-colors",
                      active
                        ? "text-white"
                        : "border-transparent text-muted hover:border-[#4a4a4a] hover:text-white",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsSidebar({ groups }: { groups: DocsNavGroup[] }) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-10 pr-2">
        <DocsNavTree groups={groups} />
      </div>
    </div>
  );
}

export function DocsMobileBar({ groups }: { groups: DocsNavGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="docs-mobile-nav"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-[12.5px] text-muted transition-colors hover:border-white/40 hover:text-white"
      >
        <Menu className="h-3.5 w-3.5" aria-hidden="true" />
        Documentation menu
      </button>

      {open ? (
          <div
            id="docs-mobile-nav"
            className="menu-overlay fixed inset-0 z-[70] overflow-y-auto bg-black"
          >
            <div className="page-shell py-5">
              <div className="flex items-center justify-between">
                <p className="t-label text-faint">Documentation</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close documentation menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-8">
                <DocsNavTree groups={groups} onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </div>
        ) : null}
    </div>
  );
}
