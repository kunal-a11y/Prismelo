"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { ResourceMeta } from "@/lib/resources";
import { ServiceGlyph } from "@/components/art";
import { Tag } from "@/components/tag";
import type { GlyphKey } from "@/lib/services";
import { toneForSlug } from "@/lib/accents";
import { cn, formatDate } from "@/lib/utils";

const categoryGlyph: Record<string, GlyphKey> = {
  Security: "pentest",
  Engineering: "software",
  Design: "web",
  AI: "ai",
  Infrastructure: "cloud",
};

export function ResourceArt({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "resource-art flex items-center justify-center border border-line bg-[#050505]",
        className,
      )}
    >
      <ServiceGlyph
        glyph={categoryGlyph[category] ?? "consulting"}
        className="resource-art__glyph h-full w-full max-h-72 max-w-72 p-2 opacity-90"
      />
    </div>
  );
}

export function ResourcesIndex({ items }: { items: ResourceMeta[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        !trimmed ||
        [item.title, item.description, item.category]
          .join(" ")
          .toLowerCase()
          .includes(trimmed);
      return matchesCategory && matchesQuery;
    });
  }, [items, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter by category"
          className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1"
        >
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[11.5px] transition-colors",
                category === item
                  ? "border-white bg-white text-black"
                  : "border-line text-muted hover:border-white/40 hover:text-white",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <label htmlFor="resource-search" className="sr-only">
            Search articles
          </label>
          <input
            id="resource-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            className="h-9 w-full rounded-full border border-line bg-transparent pl-9 pr-9 text-[12.5px] text-white outline-none transition-colors placeholder:text-faint focus:border-white/40"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <p className="t-mono py-4 text-faint">
        {filtered.length} ARTICLE{filtered.length === 1 ? "" : "S"}
      </p>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#242424] px-6 py-16 text-center">
          <p className="text-[14px] text-white">No articles found</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            Nothing matches that filter. Try another category or a shorter
            search.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-5 rounded-full border border-line px-4 py-1.5 text-[12px] text-white transition-colors hover:border-white/40"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid border-t border-line md:grid-cols-2">
          {filtered.map((item) => (
            <article
              key={item.slug}
              className="group border-b border-line md:odd:border-r"
            >
              <Link
                href={`/resources/${item.slug}`}
                className="flex h-full flex-col gap-5 p-6 transition-colors hover:bg-white/[0.018] md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <Tag tone={toneForSlug(item.category)} dot={false}>
                    {item.category}
                  </Tag>
                  <span className="t-mono text-faint">
                    {item.readingTime} MIN
                  </span>
                </div>

                <h3 className="max-w-md text-[19px] leading-snug tracking-[-0.02em] text-white md:text-[21px]">
                  {item.title}
                </h3>

                <p className="line-clamp-3 max-w-md text-[13px] leading-relaxed text-muted">
                  {item.description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
                  <span className="t-mono text-faint">
                    {formatDate(item.date)}
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
