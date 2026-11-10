"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Lock, MessageSquare, Search, X } from "lucide-react";
import { formatCommunityDate, type Discussion } from "@/lib/community";
import { Tag } from "@/components/tag";
import { toneForSlug } from "@/lib/accents";
import { cn } from "@/lib/utils";

type Sort = "latest" | "replies";

const sorts: { value: Sort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "replies", label: "Most replies" },
];

export function DiscussionList({
  items,
  showCategory = true,
}: {
  items: Discussion[];
  showCategory?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("latest");

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const matched = trimmed
      ? items.filter((item) =>
          [item.title, item.excerpt, item.author, item.category]
            .join(" ")
            .toLowerCase()
            .includes(trimmed),
        )
      : items;

    const sorted = [...matched].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (b.pinned && !a.pinned) return 1;
      if (sort === "replies") return b.replies - a.replies;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return sorted;
  }, [items, query, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <label htmlFor="discussion-search" className="sr-only">
            Search discussions
          </label>
          <input
            id="discussion-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search discussions"
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

        <div className="flex items-center gap-2">
          <span className="t-mono hidden text-faint sm:block">SORT</span>
          <div
            role="group"
            aria-label="Sort discussions"
            className="flex items-center gap-0.5 rounded-full border border-line p-0.5"
          >
            {sorts.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSort(option.value)}
                aria-pressed={sort === option.value}
                className={cn(
                  "rounded-full px-3 py-1 text-[11.5px] transition-colors",
                  sort === option.value
                    ? "bg-white text-black"
                    : "text-muted hover:text-white",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="t-mono py-3 text-faint">
        {filtered.length} DISCUSSION{filtered.length === 1 ? "" : "S"}
        {query ? ` MATCHING “${query.toUpperCase()}”` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#242424] px-6 py-14 text-center">
          <p className="text-[14px] text-white">No discussions found</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            Nothing matches that search. Try a shorter phrase, or browse a
            category from the list.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 rounded-full border border-line px-4 py-1.5 text-[12px] text-white transition-colors hover:border-white/40"
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="border-t border-line">
          {filtered.map((discussion) => (
            <li key={discussion.slug}>
              <Link
                href={`/community/t/${discussion.slug}`}
                className="group grid gap-3 border-b border-line py-5 transition-colors hover:bg-white/[0.015] md:grid-cols-[1fr_auto] md:items-start md:gap-8 md:px-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {discussion.pinned ? (
                      <Tag tone="amber">Pinned</Tag>
                    ) : null}
                    {showCategory ? (
                      <Tag tone={toneForSlug(discussion.category)} dot={false}>
                        {discussion.category.replace("-", " ")}
                      </Tag>
                    ) : null}
                    <span className="t-mono text-faint">
                      {formatCommunityDate(discussion.createdAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[15.5px] leading-snug text-white md:text-[16.5px]">
                    {discussion.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-muted">
                    {discussion.excerpt}
                  </p>
                  <p className="mt-2.5 flex items-center gap-2 text-[11.5px] text-faint">
                    by {discussion.authorName}
                    {discussion.locked ? (
                      <span className="inline-flex items-center gap-1 text-faint">
                        <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                        locked
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="flex items-center gap-5 md:pt-1">
                  <div className="flex items-center gap-1.5 text-faint">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="t-mono">{discussion.replies}</span>
                  </div>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-[#333] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
