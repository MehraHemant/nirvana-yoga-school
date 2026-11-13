import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/content/repositories/blog-post";
import { listPublicPages } from "@/content/repositories/page-seo";
import { publicPathForPage } from "@/lib/cms/cache";
import { absoluteUrl } from "@/lib/seo/site";

/** Rebuild hourly, matching the content cache TTL. */
export const revalidate = 3600;

/** Hub / listing pages that should be crawled as often as programs. */
const HUB_SLUGS = new Set([
  "yoga-teacher-training-in-rishikesh-india",
  "online-yoga-teacher-training-courses",
  "blog",
]);

/**
 * Crawl priority hint per page type.
 *
 * @param slug - Page slug
 * @param type - Page type
 */
function priorityFor(slug: string, type: string): number {
  if (slug === "home") return 1;
  if (type === "course" || HUB_SLUGS.has(slug)) return 0.9;
  if (type === "online" || type === "retreat") return 0.8;
  if (type === "venue" || slug === "teacher" || slug === "about-us") return 0.7;
  return 0.5;
}

/**
 * sitemap.xml — every published, indexable CMS page plus all blog posts,
 * generated from the database so new pages appear automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([
    listPublicPages(),
    getBlogPosts()
      .then((r) => r.data ?? [])
      .catch(() => []),
  ]);

  const entries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: absoluteUrl(publicPathForPage(page.slug, page.type)),
    ...(page.updatedAt ? { lastModified: new Date(page.updatedAt) } : {}),
    changeFrequency:
      page.type === "course" || page.type === "retreat" || page.slug === "home"
        ? "weekly"
        : "monthly",
    priority: priorityFor(page.slug, page.type),
    ...(page.image ? { images: [page.image] } : {}),
  }));

  if (!pages.some((p) => p.slug === "home")) {
    entries.unshift({
      url: absoluteUrl("/"),
      priority: 1,
      changeFrequency: "weekly",
    });
  }

  for (const post of posts) {
    if (post.published === false) continue;
    entries.push({
      url: absoluteUrl(`/blog/${post.slug}`),
      ...(post.publishedAt ? { lastModified: new Date(post.publishedAt) } : {}),
      changeFrequency: "yearly",
      priority: 0.6,
      ...(post.image ? { images: [post.image] } : {}),
    });
  }

  return entries;
}
