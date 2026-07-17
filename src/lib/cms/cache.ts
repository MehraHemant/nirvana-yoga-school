import { revalidateTag, unstable_cache } from "next/cache";
import type {
  BlogPostDocument,
  PageModulesDocument,
  SitePageDocument,
} from "@/content/types";
import { mapPageModulesFromRow } from "@/lib/cms/db-page-modules";
import {
  mapPageToSitePageDocument,
  pageWithRelations,
} from "@/lib/cms/db-to-document";
import { prisma } from "@/lib/db";

/**
 * Cache tag for a content slug.
 *
 * @param slug - Page or post slug
 */
export function contentCacheTag(slug: string): string {
  return `page:${slug}`;
}

/**
 * Invalidate cached content for a slug after admin writes.
 *
 * @param slug - Page or post slug
 * @param pageType - Optional page type to also bust type-slug list caches
 */
export function invalidateContentCache(
  slug: string,
  pageType?: "course" | "online" | "retreat" | "venue" | "site" | string,
): void {
  revalidateTag(contentCacheTag(slug), "max");
  if (pageType) {
    revalidateTag(`pages:type:${pageType}`, "max");
  }
}

/**
 * Invalidate a global_settings cache entry (header, footer, reviews, …).
 *
 * @param key - `global_settings.key` value
 */
export function invalidateGlobalSettingsCache(key: string): void {
  revalidateTag(`global-settings:${key}`, "max");
}

/**
 * Fetch a site page from Postgres with Next.js data cache.
 *
 * @param slug - Page slug
 */
export async function fetchSitePageFromDb(
  slug: string,
): Promise<SitePageDocument | null> {
  const cached = unstable_cache(
    async () => {
      const page = await prisma.page.findUnique({
        where: { slug },
        include: pageWithRelations,
      });
      if (!page || !page.published) return null;
      return mapPageToSitePageDocument(page);
    },
    [`site-page-${slug}`],
    {
      tags: [contentCacheTag(slug)],
      revalidate: 3600,
    },
  );

  return cached();
}

/**
 * Fetch a course document JSON blob from Postgres.
 *
 * @param slug - Course page slug
 */
export async function fetchCourseDocumentFromDb<T>(
  slug: string,
): Promise<T | null> {
  const cached = unstable_cache(
    async () => {
      const page = await prisma.page.findUnique({
        where: { slug },
        include: { courseDoc: true },
      });
      if (!page || !page.published || !page.courseDoc?.document) return null;
      return page.courseDoc.document as T;
    },
    [`course-doc-${slug}`],
    {
      tags: [contentCacheTag(slug)],
      revalidate: 3600,
    },
  );

  return cached();
}

/**
 * Fetch page modules from Postgres with Next.js data cache.
 *
 * @param slug - Page slug
 */
export async function fetchPageModulesFromDb(
  slug: string,
): Promise<PageModulesDocument | null> {
  const cached = unstable_cache(
    async () => {
      const page = await prisma.page.findUnique({
        where: { slug },
        select: { pageModules: true, published: true },
      });
      if (!page || !page.published) return null;
      return mapPageModulesFromRow(page);
    },
    [`page-modules-${slug}`],
    {
      tags: [contentCacheTag(slug)],
      revalidate: 3600,
    },
  );

  return cached();
}

/**
 * Fetch a blog post from Postgres with Next.js data cache.
 *
 * @param slug - Blog post slug
 */
export async function fetchBlogPostFromDb(
  slug: string,
): Promise<BlogPostDocument | null> {
  const cached = unstable_cache(
    async () => {
      const post = await prisma.blogPost.findUnique({
        where: { slug },
      });
      if (!post || !post.published) return null;
      return {
        slug: post.slug,
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        image: post.image,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        content: post.content as BlogPostDocument["content"],
        bodyHtml: post.bodyHtml,
      };
    },
    [`blog-post-${slug}`],
    {
      tags: [contentCacheTag(slug)],
      revalidate: 3600,
    },
  );

  return cached();
}

/**
 * Fetch all published blog posts from Postgres.
 */
export async function fetchBlogPostsFromDb(): Promise<BlogPostDocument[]> {
  const cached = unstable_cache(
    async () => {
      const posts = await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
      });
      return posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        image: post.image,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        content: post.content as BlogPostDocument["content"],
        bodyHtml: post.bodyHtml,
      }));
    },
    ["blog-posts-all"],
    { tags: ["blog:all"], revalidate: 3600 },
  );

  return cached();
}

/**
 * Fetch global settings from Postgres with Next.js data cache.
 *
 * @param key - Settings key (header, footer, siteConfig)
 */
export async function fetchGlobalSettingsFromDb(
  key: string,
): Promise<unknown | null> {
  const cached = unstable_cache(
    async () => {
      const record = await prisma.globalSettings.findUnique({ where: { key } });
      return record?.value ?? null;
    },
    [`global-settings-${key}`],
    {
      tags: [`global-settings:${key}`],
      revalidate: 3600,
    },
  );

  return cached();
}

/**
 * Public helper to fetch global settings with cache.
 */
export async function getGlobalSettings(key: string): Promise<unknown | null> {
  return fetchGlobalSettingsFromDb(key);
}

/**
 * List published page slugs filtered by CMS page type.
 *
 * @param type - Prisma `PageType` value
 * @returns Slug strings ordered by title
 */
export async function fetchPageSlugsByTypeFromDb(
  type: "course" | "online" | "retreat" | "venue" | "site",
): Promise<string[]> {
  const cached = unstable_cache(
    async () => {
      const pages = await prisma.page.findMany({
        where: { type, published: true },
        select: { slug: true },
        orderBy: { title: "asc" },
      });
      return pages.map((page) => page.slug);
    },
    [`page-slugs-${type}`],
    { tags: [`pages:type:${type}`], revalidate: 3600 },
  );

  return cached();
}

/**
 * List all published blog post slugs.
 *
 * @returns Blog slugs newest first
 */
export async function fetchBlogSlugsFromDb(): Promise<string[]> {
  const cached = unstable_cache(
    async () => {
      const posts = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true },
        orderBy: { publishedAt: "desc" },
      });
      return posts.map((post) => post.slug);
    },
    ["blog-slugs-all"],
    { tags: ["blog:all"], revalidate: 3600 },
  );

  return cached();
}
