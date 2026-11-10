#!/usr/bin/env node
/**
 * Create a new Resources post.
 *
 *   npm run new:post
 *   npm run new:post -- --title "Why we write runbooks" --category Engineering
 *
 * Writes content/resources/<slug>.mdx with the frontmatter the site needs.
 * The site picks the file up automatically — no other edits required.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const RESOURCES_DIR = path.join(process.cwd(), "content", "resources");
const CATEGORIES = ["Security", "Engineering", "Design", "AI", "Infrastructure"];

function flag(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    console.error(`Missing value for --${name}`);
    process.exit(1);
  }
  return value;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function yaml(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

async function main() {
  if (!fs.existsSync(RESOURCES_DIR)) {
    console.error(`No content directory at ${RESOURCES_DIR}. Run this from the project root.`);
    process.exit(1);
  }

  const interactive = !flag("title");
  const rl = interactive
    ? readline.createInterface({ input: stdin, output: stdout })
    : null;

  const ask = async (question, fallback) => {
    if (!rl) return fallback;
    const answer = (await rl.question(question)).trim();
    return answer || fallback;
  };

  const title = flag("title") ?? (await ask("Title: ", ""));
  if (!title) {
    console.error("A title is required.");
    process.exit(1);
  }

  const description = flag("description") ?? (await ask("Description (one sentence): ", ""));
  const category =
    flag("category") ??
    (await ask(`Category [${CATEGORIES.join(", ")}] (default Engineering): `, "Engineering"));
  const date = flag("date") ?? today();

  rl?.close();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`Date must look like 2026-11-08, got "${date}".`);
    process.exit(1);
  }
  if (!CATEGORIES.includes(category)) {
    console.warn(`Warning: "${category}" is not one of ${CATEGORIES.join(", ")}. It will still render.`);
  }

  let slug = slugify(title);
  if (!slug) {
    console.error("That title produced an empty slug. Add some letters or numbers.");
    process.exit(1);
  }

  let file = path.join(RESOURCES_DIR, `${slug}.mdx`);
  for (let n = 2; fs.existsSync(file); n += 1) {
    file = path.join(RESOURCES_DIR, `${slug}-${n}.mdx`);
  }

  const body = `---\ntitle: ${yaml(title)}\ndescription: ${yaml(description || title)}\ncategory: ${yaml(category)}\ndate: ${date}\nfeatured: false\n---\n\nStart writing here.\n\n## A section heading\n\nParagraph text.\n`;

  fs.writeFileSync(file, body, "utf8");

  console.log(`\nCreated ${path.relative(process.cwd(), file)}`);
  console.log(`Live at /resources/${path.basename(file, ".mdx")}`);
  console.log("Write the article in that file, then run `npm run build` to publish.");
  console.log("Prefix the filename with _ to keep it as a draft.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
