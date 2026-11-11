import type { MetadataRoute } from "next";
import { services } from "@/lib/services";
import { DOC_NAV } from "@/lib/docs";
import { getResourceSlugs } from "@/lib/resources";
import { communityCategories } from "@/lib/community";
import { listDiscussions } from "@/lib/community-data";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/companies", priority: 0.8 },
    { path: "/services", priority: 0.9 },
    { path: "/founder", priority: 0.6 },
    { path: "/docs", priority: 0.8 },
    { path: "/community", priority: 0.7 },
    { path: "/resources", priority: 0.8 },
    { path: "/contact", priority: 0.9 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...services.map((service) => ({
      url: `${site.url}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...DOC_NAV.flatMap((group) =>
      group.items.map((item) => ({
        url: `${site.url}/docs${item.slug ? `/${item.slug}` : ""}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ),
    ...getResourceSlugs().map((slug) => ({
      url: `${site.url}/resources/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...communityCategories.map((category) => ({
      url: `${site.url}/community/c/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...(await listDiscussions()).map((discussion) => ({
      url: `${site.url}/community/t/${discussion.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
