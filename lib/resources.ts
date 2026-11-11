import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { RESOURCE_FILES } from "@/lib/generated-content";

/**
 * Resources are sample articles published to demonstrate the format.
 * They are labelled as sample content in the UI and are not company news.
 */

export type ResourceMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  featured?: boolean;
  readingTime: number;
};

const RESOURCES_DIR = path.join(process.cwd(), "content", "resources");

function readResource(slug: string) {
  const raw = fs.existsSync(path.join(RESOURCES_DIR, `${slug}.mdx`))
    ? fs.readFileSync(path.join(RESOURCES_DIR, `${slug}.mdx`), "utf8")
    : RESOURCE_FILES[slug];
  if (!raw) throw new Error(`Missing resource content: ${slug}`);
  const { data, content } = matter(raw);
  const words = content.trim().split(/\s+/).length;
  return {
    meta: {
      slug,
      title: data.title as string,
      description: data.description as string,
      category: data.category as string,
      // YAML parses unquoted dates into Date objects; normalise to ISO day.
      date:
        data.date instanceof Date
          ? data.date.toISOString().slice(0, 10)
          : String(data.date),
      featured: Boolean(data.featured),
      readingTime: Math.max(1, Math.round(words / 220)),
    } satisfies ResourceMeta,
    content,
  };
}

/**
 * Every `.mdx` file in content/resources is a post. Files starting with `_` are
 * ignored so a draft can sit next to the published ones without going live.
 *
 * This reads the directory on every call rather than once at module load: the
 * admin area writes files while the server is running, and a cached list would
 * hide a post until the process restarted.
 */
export function getResourceSlugs(): string[] {
  if (fs.existsSync(RESOURCES_DIR)) {
    const files = fs
      .readdirSync(RESOURCES_DIR)
      .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
      .map((file) => file.slice(0, -".mdx".length));
    if (files.length) return files.sort();
  }
  return Object.keys(RESOURCE_FILES).filter((slug) => !slug.startsWith("_")).sort();
}

export function getResources(): ResourceMeta[] {
  return getResourceSlugs()
    .map((slug) => readResource(slug).meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getResource(slug: string) {
  if (!getResourceSlugs().includes(slug)) return null;
  return readResource(slug);
}

export function getRelatedResources(slug: string, count = 3) {
  const all = getResources();
  const current = all.find((item) => item.slug === slug);
  const sameCategory = all.filter(
    (item) => item.slug !== slug && item.category === current?.category,
  );
  const others = all.filter(
    (item) => item.slug !== slug && item.category !== current?.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}
