/**
 * Client-safe community types and constants.
 *
 * Data access lives in lib/community-data.ts, which reads the server's data
 * file — client components import from here only.
 */

export type CommunityCategory = {
  slug: string;
  name: string;
  description: string;
};

export type Discussion = {
  slug: string;
  title: string;
  category: string;
  author: string;
  authorName: string;
  excerpt: string;
  body: string[];
  createdAt: string;
  replies: number;
  pinned: boolean;
  locked: boolean;
};

export type CommunityProfile = {
  username: string;
  displayName: string;
  bio: string;
  role: string;
  joinedAt: string;
};

export const communityCategories: CommunityCategory[] = [
  {
    slug: "general",
    name: "General Discussion",
    description: "Anything about technology, engineering practice or the group.",
  },
  {
    slug: "development",
    name: "Development",
    description: "Implementation questions, patterns, tooling and code review.",
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    description: "Defensive practice, assessment methodology and disclosure.",
  },
  {
    slug: "ai",
    name: "AI & Machine Learning",
    description: "Applied models, evaluation, retrieval and production constraints.",
  },
  {
    slug: "cloud",
    name: "Cloud & Infrastructure",
    description: "Deployment, reliability, hosting architecture and cost.",
  },
  {
    slug: "feedback",
    name: "Product Feedback",
    description: "Notes on Prismelo products, documentation and this website.",
  },
];

export function getCategory(slug: string) {
  return communityCategories.find((category) => category.slug === slug);
}

export function formatCommunityDate(iso: string) {
  const value = iso.length === 10 ? `${iso}T00:00:00Z` : iso;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatCommunityDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}
