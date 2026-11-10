/**
 * Client-safe category list. Kept free of Node imports so the admin form can
 * share it with the server-side post helpers.
 */
export const POST_CATEGORIES = [
  "Security",
  "Engineering",
  "Design",
  "AI",
  "Infrastructure",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
