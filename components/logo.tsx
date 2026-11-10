"use client";

import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Prismelo brand symbol, traced from the source artwork: a lit upper diamond,
 * a light face down the right edge and a shadowed triangle under the left,
 * which leaves the characteristic notch. Rendered as gradients so it stays
 * sharp at any size and carries no background of its own.
 */
export function PrismeloMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const top = `pl-top-${uid}`;
  const topRight = `pl-topr-${uid}`;
  const face = `pl-face-${uid}`;
  const shadow = `pl-shadow-${uid}`;
  const sheen = `pl-sheen-${uid}`;
  const clip = `pl-clip-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={cn("prism-mark h-5 w-5", className)}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={top} x1="8" y1="25" x2="50" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f1f1f1" />
          <stop offset="0.45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={topRight} x1="52" y1="2" x2="94" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#fbfbfb" />
          <stop offset="1" stopColor="#ececec" />
        </linearGradient>
        <linearGradient id={face} x1="94" y1="24" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0f0f0" />
          <stop offset="0.45" stopColor="#dcdcdc" />
          <stop offset="1" stopColor="#bcbcbc" />
        </linearGradient>
        <linearGradient id={shadow} x1="7" y1="74" x2="48" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#585858" />
          <stop offset="0.55" stopColor="#333333" />
          <stop offset="1" stopColor="#161616" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clip}>
          <path d="M50 0 94 23 94 73 50 100 6 73 50 46 6 23Z" />
        </clipPath>
      </defs>

      <g className="prism-mark__body">
        {/* lit upper diamond */}
        <path d="M6 23 50 0 50 46Z" fill={`url(#${top})`} />
        <path d="M50 0 94 23 50 46Z" fill={`url(#${topRight})`} />
        {/* light face down the right edge */}
        <path d="M50 46 94 23 94 73 50 100Z" fill={`url(#${face})`} />
        {/* shadowed triangle under the left — leaves the notch open */}
        <path d="M50 46 6 73 50 100Z" fill={`url(#${shadow})`} />
        <path
          d="M50 46 94 23"
          stroke="#000000"
          strokeOpacity="0.07"
          strokeWidth="0.7"
        />
        <path
          d="M50 46 6 73"
          stroke="#000000"
          strokeOpacity="0.12"
          strokeWidth="0.7"
        />
      </g>

      <g clipPath={`url(#${clip})`} className="prism-mark__sheen" aria-hidden="true">
        <rect x="-40" y="-4" width="26" height="108" fill={`url(#${sheen})`} transform="skewX(-20)" />
      </g>
    </svg>
  );
}

export function Wordmark({
  className,
  showTech = true,
}: {
  className?: string;
  showTech?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[1px] text-[13px] font-medium tracking-[0.22em] text-white",
        className,
      )}
    >
      PRISMELO{" "}
      {showTech ? (
        <span className="ml-[3px] tracking-[0.12em] text-faint">TECHNOLOGY</span>
      ) : null}
    </span>
  );
}

export function Logo({
  className,
  href = "/",
  showTech = true,
}: {
  className?: string;
  href?: string;
  showTech?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Prismelo — home"
      className={cn(
        "group/logo inline-flex items-center gap-2.5 text-white",
        className,
      )}
    >
      <PrismeloMark className="h-6 w-6 shrink-0" />
      <Wordmark showTech={showTech} />
    </Link>
  );
}
