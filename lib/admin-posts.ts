import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { POST_CATEGORIES } from "@/lib/post-categories";

/**
 * Read/write helpers for the admin area. Posts are plain `.mdx` files in
 * content/resources; a draft is the same file with a leading underscore, which
 * the public resource list ignores.
 */

export const RESOURCES_DIR = path.join(process.cwd(), "content", "resources");

export { POST_CATEGORIES };

export type AdminPost = {
  slug: string;
  draft: boolean;
  title: string;
  description: string;
  category: string;
  date: string;
  featured: boolean;
  body: string;
};

export type PostInput = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  featured: boolean;
  draft: boolean;
  body: string;
};

export type FieldErrors = Partial<Record<keyof PostInput, string>>;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

function fileFor(slug: string, draft: boolean) {
  return path.join(RESOURCES_DIR, `${draft ? "_" : ""}${slug}.mdx`);
}

function readPost(slug: string, draft: boolean): AdminPost {
  const raw = fs.readFileSync(fileFor(slug, draft), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    draft,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    category: String(data.category ?? "Engineering"),
    date:
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : String(data.date ?? today()),
    featured: Boolean(data.featured),
    body: content.replace(/^\s*\n/, "").trimEnd(),
  };
}

export function listAdminPosts(): AdminPost[] {
  if (!fs.existsSync(RESOURCES_DIR)) return [];
  return fs
    .readdirSync(RESOURCES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const draft = file.startsWith("_");
      const slug = file.slice(draft ? 1 : 0, -".mdx".length);
      return readPost(slug, draft);
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** Finds a post either published or as a draft. */
export function findAdminPost(slug: string): AdminPost | null {
  for (const draft of [false, true]) {
    if (fs.existsSync(fileFor(slug, draft))) return readPost(slug, draft);
  }
  return null;
}

export function validatePost(input: PostInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.title.trim()) errors.title = "Add a title.";
  else if (input.title.trim().length > 120) errors.title = "Keep the title under 120 characters.";

  if (!input.description.trim()) errors.description = "Add a one-sentence description.";
  else if (input.description.trim().length > 220)
    errors.description = "Keep the description under 220 characters.";

  if (!(POST_CATEGORIES as readonly string[]).includes(input.category))
    errors.category = "Choose one of the listed categories.";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) errors.date = "Use the format 2026-11-08.";
  else if (Number.isNaN(new Date(`${input.date}T00:00:00Z`).getTime()))
    errors.date = "That date does not exist.";

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug))
    errors.slug = "Use lowercase letters, numbers and single hyphens.";

  if (input.body.trim().length < 40)
    errors.body = "Write at least a short paragraph before saving.";

  return errors;
}

function frontmatter(input: PostInput) {
  const quote = (value: string) => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  return [
    "---",
    `title: ${quote(input.title.trim())}`,
    `description: ${quote(input.description.trim())}`,
    `category: ${quote(input.category)}`,
    `date: ${input.date}`,
    `featured: ${input.featured}`,
    "---",
    "",
    input.body.trim(),
    "",
  ].join("\n");
}

/**
 * Writes the file, creating it or replacing the previous version. Moving
 * between draft and published renames the file rather than copying, so a post
 * never exists twice.
 */
export function saveAdminPost(
  input: PostInput,
  previous?: { slug: string; draft: boolean },
): AdminPost {
  const errors = validatePost(input);
  if (Object.keys(errors).length > 0) {
    const error = new Error("invalid" as string) as Error & { fields: FieldErrors };
    error.fields = errors;
    throw error;
  }

  fs.mkdirSync(RESOURCES_DIR, { recursive: true });

  const target = fileFor(input.slug, input.draft);
  const previousFile = previous ? fileFor(previous.slug, previous.draft) : null;

  if (fs.existsSync(target) && target !== previousFile) {
    const error = new Error("conflict") as Error & { fields: FieldErrors };
    error.fields = { slug: "A post already uses that URL. Pick another title." };
    throw error;
  }

  fs.writeFileSync(target, frontmatter(input), "utf8");
  if (previousFile && previousFile !== target && fs.existsSync(previousFile)) {
    fs.unlinkSync(previousFile);
  }

  return readPost(input.slug, input.draft);
}

export function deleteAdminPost(slug: string) {
  const post = findAdminPost(slug);
  if (!post) return false;
  fs.unlinkSync(fileFor(slug, post.draft));
  return true;
}
