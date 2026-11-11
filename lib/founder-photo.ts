import { site } from "@/lib/site";

/**
 * Only use an intentionally configured portrait. A file discovered by name in
 * public/ may be unrelated artwork; leave the designed initials plate in place
 * until a real founder portrait is explicitly selected in site.ts.
 */
export function founderPhoto(): string | undefined {
  return site.founderPhoto || undefined;
}
