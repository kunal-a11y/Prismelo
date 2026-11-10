import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn btn-sheen relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "btn-primary bg-white text-black hover:bg-[#e2e2e2] focus-visible:bg-[#e2e2e2]",
  secondary:
    "btn-secondary border border-line bg-transparent text-white hover:border-white/45 hover:bg-white/[0.045]",
  ghost: "text-muted hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[13.5px]",
  lg: "h-12 px-6 text-sm",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  withArrow?: boolean;
  children: React.ReactNode;
};

export function ButtonLink({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  withArrow,
  children,
}: CommonProps & { href: string; external?: boolean }) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {children}
      {withArrow ? (
        <ArrowUpRight
          className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-[2px] group-hover/btn:-translate-y-[2px]"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  withArrow,
  type = "button",
  disabled,
  onClick,
  children,
}: CommonProps & {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
      {withArrow ? (
        <ArrowUpRight
          className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-[2px] group-hover/btn:-translate-y-[2px]"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

export function TextLink({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    "group/link inline-flex items-center gap-1.5 text-[13.5px] text-white transition-colors hover:text-muted",
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
      <ArrowUpRight
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-[2px] group-hover/link:-translate-y-[2px]"
        aria-hidden="true"
      />
    </Link>
  );
}
