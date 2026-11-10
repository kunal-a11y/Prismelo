"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X } from "lucide-react";
import type { SearchEntry } from "@/lib/docs";
import { cn } from "@/lib/utils";

export function DocsSearch({ index }: { index: SearchEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return index.slice(0, 7);
    return index
      .filter((entry) => {
        const haystack = [
          entry.title,
          entry.description,
          entry.group,
          ...entry.headings,
        ]
          .join(" ")
          .toLowerCase();
        return trimmed.split(/\s+/).every((word) => haystack.includes(word));
      })
      .slice(0, 8);
  }, [index, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const go = useCallback(
    (href?: string) => {
      if (!href) return;
      close();
      router.push(href);
    },
    [close, router],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center gap-2.5 rounded-full border border-line px-3.5 text-left text-[12.5px] text-faint transition-colors hover:border-white/35 hover:text-muted"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="flex-1">Search documentation</span>
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">
          ⌘K
        </kbd>
      </button>

      {open ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
            className="menu-overlay fixed inset-0 z-[80] flex items-start justify-center bg-black/85 px-4 pt-[12vh] backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div className="menu-pop w-full max-w-xl border border-line bg-[#060606] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-3 border-b border-line px-4">
                <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setActive((value) =>
                        results.length ? (value + 1) % results.length : 0,
                      );
                    }
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      setActive((value) =>
                        results.length
                          ? (value - 1 + results.length) % results.length
                          : 0,
                      );
                    }
                    if (event.key === "Enter") {
                      event.preventDefault();
                      go(results[active]?.href);
                    }
                  }}
                  placeholder="Search articles, guides, services…"
                  aria-label="Search query"
                  className="h-12 w-full bg-transparent text-[14px] text-white outline-none placeholder:text-faint"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close search"
                  className="text-faint transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="max-h-[52vh] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-[13.5px] text-muted">
                      No articles match “{query}”.
                    </p>
                    <p className="t-mono mt-2 text-faint">
                      Try a service name or a single keyword.
                    </p>
                  </div>
                ) : (
                  <ul>
                    {results.map((entry, index) => (
                      <li key={entry.href}>
                        <button
                          type="button"
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(entry.href)}
                          className={cn(
                            "flex w-full items-start justify-between gap-4 px-3 py-2.5 text-left",
                            index === active ? "bg-white/[0.06]" : "",
                          )}
                        >
                          <span>
                            <span className="block text-[13px] text-white">
                              {entry.title}
                            </span>
                            <span className="mt-0.5 block text-[11.5px] text-faint">
                              {entry.group}
                            </span>
                          </span>
                          {index === active ? (
                            <CornerDownLeft
                              className="mt-1 h-3 w-3 shrink-0 text-faint"
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
                <span className="t-mono text-faint">
                  {results.length} RESULT{results.length === 1 ? "" : "S"}
                </span>
                <span className="t-mono hidden text-faint sm:block">
                  ↑ ↓ TO NAVIGATE · ENTER TO OPEN · ESC TO CLOSE
                </span>
              </div>
            </div>
          </div>
        ) : null}
    </>
  );
}
