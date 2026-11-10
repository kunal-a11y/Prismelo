import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { accentToneClass, type Tone } from "@/lib/accents";

/**
 * Small monochrome-first status chip with a coloured accent.
 * Colour is carried by the text/border/dot via `currentColor`, so a single
 * tone class recolours the whole tag.
 */
export function Tag({
  children,
  tone = "neutral",
  dot = true,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("tag", accentToneClass[tone], className)}>
      {dot ? <span aria-hidden="true" className="tag-dot" /> : null}
      {children}
    </span>
  );
}
