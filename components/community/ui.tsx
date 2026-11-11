import Link from "next/link";
import { discussionCounts } from "@/lib/community-data";
import { communityCategories } from "@/lib/community";
import { accentHex, toneForSlug } from "@/lib/accents";
import { cn } from "@/lib/utils";

export function CommunityAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-[11px]",
    lg: "h-16 w-16 text-[18px]",
  };

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-[#333] bg-[#0d0d0d] font-mono text-white",
        sizes[size],
        className,
      )}
    >
      {initials || "?"}
    </span>
  );
}

export async function CategoryNav({
  active,
  className,
}: {
  active?: string;
  className?: string;
}) {
  const counts = await discussionCounts();
  return (
    <nav aria-label="Categories" className={className}>
      <p className="t-label mb-4 text-faint">Categories</p>
      <ul className="border-t border-line">
        <li>
          <Link
            href="/community"
            className={cn(
              "flex items-center justify-between border-b border-line py-2.5 text-[13px] transition-colors",
              !active ? "text-white" : "text-muted hover:text-white",
            )}
          >
            All discussions
            <span className="t-mono text-faint">
              {String(counts.total).padStart(2, "0")}
            </span>
          </Link>
        </li>
        {communityCategories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/community/c/${category.slug}`}
              aria-current={active === category.slug ? "page" : undefined}
              className={cn(
                "flex items-center justify-between gap-3 border-b border-line py-2.5 text-[13px] transition-colors",
                active === category.slug
                  ? "text-white"
                  : "text-muted hover:text-white",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: accentHex(toneForSlug(category.slug)) }}
                />
                {category.name}
              </span>
              <span className="t-mono text-faint">
                {String(counts.byCategory[category.slug] ?? 0).padStart(2, "0")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const communityGuidelines = [
  "Ask about the problem, not only the error message.",
  "Do not post live vulnerabilities or personal data — use the disclosure route.",
  "Disagree with reasoning, not with people.",
  "No vendor promotion or recruiting posts.",
];
