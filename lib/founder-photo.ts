import fs from "node:fs";
import path from "node:path";
import { site } from "@/lib/site";

const candidates = ["founder.jpg", "founder.jpeg", "founder.png", "founder.webp"];

/**
 * Portrait for the founder card. `site.founderPhoto` wins if it is set;
 * otherwise the first matching file in `public/` is used. Resolved at render
 * time on the server, so nothing is fetched from a third-party host.
 */
export function founderPhoto(): string | undefined {
  if (site.founderPhoto) return site.founderPhoto;

  for (const name of candidates) {
    if (fs.existsSync(path.join(process.cwd(), "public", name))) {
      return `/${name}`;
    }
  }

  return undefined;
}
