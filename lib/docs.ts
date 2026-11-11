import matter from "gray-matter";
import { DOC_FILES } from "@/lib/generated-content";

export type DocStatus = "Published" | "Placeholder";

export type DocMeta = {
  slug: string[]; // [] for /docs
  href: string;
  title: string;
  description: string;
  status: DocStatus;
  group: string;
  order: number;
};

export type DocHeading = { id: string; text: string; level: number };

type DocNavGroup = {
  title: string;
  items: { title: string; slug: string }[];
};

export const DOC_NAV: DocNavGroup[] = [
  {
    title: "Overview",
    items: [{ title: "Documentation overview", slug: "" }],
  },
  {
    title: "Getting started",
    items: [
      { title: "Introduction", slug: "getting-started" },
      { title: "Engagement process", slug: "getting-started/engagement-process" },
      { title: "Contact & communication", slug: "getting-started/contact" },
    ],
  },
  {
    title: "Company information",
    items: [
      { title: "About Prismelo", slug: "company" },
      { title: "Brand & naming", slug: "company/brand" },
      { title: "Legal & policies", slug: "company/legal" },
    ],
  },
  {
    title: "Services",
    items: [
      { title: "Services overview", slug: "services" },
      { title: "Assessment scope & authorization", slug: "services/penetration-testing" },
      { title: "Responsible disclosure", slug: "services/security-disclosure" },
    ],
  },
  {
    title: "Products",
    items: [
      { title: "Products overview", slug: "products" },
      { title: "HirenextAI", slug: "products/hirenextai" },
    ],
  },
  {
    title: "Technical guides",
    items: [
      { title: "Contact form integration", slug: "guides/contact-form-integration" },
      { title: "Community integration", slug: "guides/community-integration" },
      { title: "Documentation architecture", slug: "guides/content-architecture" },
    ],
  },
  {
    title: "FAQs",
    items: [{ title: "Frequently asked questions", slug: "faqs" }],
  },
];

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getDocSlugs() {
  return DOC_NAV.flatMap((group) => group.items.map((item) => item.slug));
}

export function getAllDocs(): DocMeta[] {
  return DOC_NAV.flatMap((group) =>
    group.items.map((item) => {
      const raw = DOC_FILES[item.slug || "overview"];
      if (!raw) throw new Error(`Missing documentation content: ${item.slug || "overview"}`);
      const { data } = matter(raw);
      return {
        slug: item.slug ? item.slug.split("/") : [],
        href: item.slug ? `/docs/${item.slug}` : "/docs",
        title: (data.title as string) ?? item.title,
        description: (data.description as string) ?? "",
        status: ((data.status as DocStatus) ?? "Published") as DocStatus,
        group: group.title,
        order: DOC_NAV.indexOf(group),
      };
    }),
  );
}

export function getDoc(slug: string[] | undefined) {
  const key = (slug ?? []).join("/");
  const raw = DOC_FILES[key || "overview"];
  if (!raw) return null;
  const { data, content } = matter(raw);
  return {
    slug: key ? key.split("/") : [],
    href: key ? `/docs/${key}` : "/docs",
    title: (data.title as string) ?? "Documentation",
    description: (data.description as string) ?? "",
    status: ((data.status as DocStatus) ?? "Published") as DocStatus,
    group:
      DOC_NAV.find((group) =>
        group.items.some((item) => item.slug === key),
      )?.title ?? "Documentation",
    content,
  };
}

export function extractHeadings(content: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const lines = content.split("\n");
  let inCodeFence = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (match) {
      const text = match[2].replace(/`/g, "").replace(/\*\*/g, "");
      headings.push({
        id: slugify(text),
        text,
        level: match[1].length,
      });
    }
  }
  return headings;
}

export function getDocNavigation(currentHref: string) {
  const flat = getAllDocs();
  const index = flat.findIndex((doc) => doc.href === currentHref);
  return {
    previous: index > 0 ? flat[index - 1] : null,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : null,
  };
}

export type SearchEntry = {
  title: string;
  href: string;
  group: string;
  description: string;
  headings: string[];
};

export function getSearchIndex(): SearchEntry[] {
  return getAllDocs().map((doc) => {
    const docData = getDoc(doc.slug);
    return {
      title: doc.title,
      href: doc.href,
      group: doc.group,
      description: doc.description,
      headings: docData
        ? extractHeadings(docData.content)
            .filter((heading) => heading.level === 2)
            .map((heading) => heading.text)
        : [],
    };
  });
}
