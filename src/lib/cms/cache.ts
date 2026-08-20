import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { inferPageType } from "@/content/pages/registry";
import { teacherSlug } from "@/content/teachers-slug";
import type {
  BlogPostDocument,
  PageModulesDocument,
  SitePageDocument,
  SitePagePerson,
} from "@/content/types";
import { mapPageModulesFromRow } from "@/lib/cms/db-page-modules";
import {
  mapPageToSitePageDocument,
  pageWithRelations,
} from "@/lib/cms/db-to-document";
import { db } from "@/lib/db";

/**
 * Cache tag for a content slug.
 *
 * @param slug - Page or post slug
 */
export function contentCacheTag(slug: string): string {
  return `page:${slug}`;
}

export type TeacherPickerOption = {
  id: string;
  slug: string;
  name: string;
  image?: string;
  role?: string;
};

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

/** YTT hub site page slug (shared FAQs + hub content). */
const YTT_HUB_SLUG = "yoga-teacher-training-in-rishikesh-india";

/** Site slugs routed outside `/[slug]`. */
const DEDICATED_SITE_PATHS: Record<string, string> = {
  home: "/",
  contact: "/contact",
  booking: "/booking",
  "enquire-now": "/enquire-now",
  teacher: "/teacher",
};

/**
 * Resolves the public URL path for a CMS page.
 *
 * @param slug - Page slug
 * @param pageType - CMS page type
 */
export function publicPathForPage(slug: string, pageType?: string): string {
  switch (pageType) {
    case "course":
      return `/course/${slug}`;
    case "online":
      return `/online-course/${slug}`;
    case "retreat":
      return `/retreat/${slug}`;
    case "venue":
      return `/venue/${slug}`;
    default:
      return DEDICATED_SITE_PATHS[slug] ?? `/${slug}`;
  }
}

/**
 * Bust product hub layout caches (listing pages, shared nav chrome).
 */
export function revalidateProductHubLayouts(): void {
  revalidatePath("/course", "layout");
  revalidatePath("/online-course", "layout");
  revalidatePath("/retreat", "layout");
}

/**
 * Bust the Full Route Cache for a CMS page's public URL.
 * Data tag invalidation alone does not refresh statically generated HTML.
 *
 * @param slug - Page slug
 * @param pageType - CMS page type
 */
export function revalidatePublicPagePaths(
  slug: string,
  pageType?: string,
): void {
  revalidatePath(publicPathForPage(slug, pageType), "page");
  switch (pageType) {
    case "course":
    case "online":
    case "retreat":
      revalidateProductHubLayouts();
      break;
  }
}

/**
 * Revalidate pages that embed sitewide shared sections (header, Why Nirvana, etc.).
 */
export function revalidateSiteWideShell(): void {
  revalidatePath("/");
  for (const path of Object.values(DEDICATED_SITE_PATHS)) {
    if (path !== "/") revalidatePath(path);
  }
  revalidateProductHubLayouts();
}

/**
 * Revalidate public blog index and optional post after admin writes.
 *
 * @param slug - Optional blog post slug
 */
export function revalidateBlogPaths(slug?: string): void {
  revalidateTag("blog:all", "max");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

/**
 * Revalidate public routes that consume a shared global_settings key.
 *
 * @param key - `global_settings.key` value
 */
export function revalidateSharedSettingsConsumers(key: string): void {
  switch (key) {
    case "header":
    case "footer":
    case "siteConfig":
    case "whyNirvana":
    case "reviews":
    case "travel":
      revalidateSiteWideShell();
      return;
    case "examCertification":
      revalidateProductHubLayouts();
      revalidatePath(`/${YTT_HUB_SLUG}`);
      return;
    case "homeFaqs":
    case "instagram":
    case "siteMap":
      revalidatePath("/");
      return;
    case "yttHub":
      revalidatePath(`/${YTT_HUB_SLUG}`);
      return;
    case "venueFaqs":
      void revalidateAllVenuePages();
      return;
    case "courseFood":
    case "retreatFood":
    case "residentialLife":
    case "retreatAccommodation":
      revalidateProductHubLayouts();
      return;
    case "bookingAddons":
      revalidatePath("/booking");
      revalidatePath("/retreat-booking");
      return;
    default:
      revalidatePath("/");
  }
}

/**
 * Revalidate all published venue detail pages.
 */
async function revalidateAllVenuePages(): Promise<void> {
  const pages = await db.page.findMany({
    where: { type: "venue", published: true },
    select: { slug: true },
  });
  for (const page of pages) {
    revalidatePath(`/venue/${page.slug}`);
  }
}

/**
 * Revalidate a CMS page's public route after admin writes (lookup type from DB).
 *
 * @param slug - Page slug
 */
export async function revalidatePageBySlug(slug: string): Promise<void> {
  const page = await db.page.findUnique({
    where: { slug },
    select: { type: true },
  });
  invalidateAndRevalidatePage(slug, page?.type ?? inferPageType(slug));
}

type FaqContextType = "page" | "global";

/**
 * Revalidate public routes after FAQ assignment changes.
 *
 * @param contextType - page | global
 * @param contextKey - Page slug or global settings key
 */
export async function revalidateFaqContext(
  contextType: FaqContextType,
  contextKey: string,
): Promise<void> {
  revalidateTag(
    `global-settings:faq-assignments:${contextType}:${contextKey}`,
    "max",
  );

  if (contextType === "global") {
    switch (contextKey) {
      case "homeFaqs":
        revalidatePath("/");
        return;
      case "venueFaqs":
        await revalidateAllVenuePages();
        return;
      case "yttHub":
        revalidatePath(`/${YTT_HUB_SLUG}`);
        return;
      default:
        revalidatePath("/");
        return;
    }
  }

  const page = await db.page.findUnique({
    where: { slug: contextKey },
    select: { type: true },
  });
  invalidateAndRevalidatePage(
    contextKey,
    page?.type ?? inferPageType(contextKey),
  );
}

/**
 * Revalidate every public route that references a catalog FAQ.
 *
 * @param faqId - FAQ id from shared catalog
 */
export async function revalidatePagesUsingFaq(faqId: string): Promise<void> {
  const assignments = await db.pageFaqAssignment.findMany({
    where: { faqId },
    select: { contextType: true, contextKey: true },
  });

  const seen = new Set<string>();
  for (const assignment of assignments) {
    const key = `${assignment.contextType}:${assignment.contextKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    await revalidateFaqContext(
      assignment.contextType as FaqContextType,
      assignment.contextKey,
    );
  }

  if (assignments.length === 0) {
    revalidateSiteWideShell();
  }
}

/**
 * Invalidate CMS data caches and the matching public route after admin writes.
 *
 * @param slug - Page slug
 * @param pageType - CMS page type
 */
export function invalidateAndRevalidatePage(
  slug: string,
  pageType?: string,
): void {
  invalidateContentCache(slug, pageType);
  revalidatePublicPagePaths(slug, pageType);
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
 * Loads a published site page from Postgres (uncached).
 *
 * @param slug - Page slug
 */
async function loadSitePageUncached(
  slug: string,
): Promise<SitePageDocument | null> {
  const page = await db.page.findUnique({
    where: { slug },
    include: pageWithRelations,
  });
  if (!page || !page.published) return null;
  return mapPageToSitePageDocument(page);
}

/**
 * Fetch a site page from Postgres with Next.js data cache.
 * Cache misses are re-checked live so newly created pages are not stuck 404
 * for the full revalidate window.
 *
 * @param slug - Page slug
 */
export async function fetchSitePageFromDb(
  slug: string,
): Promise<SitePageDocument | null> {
  const cached = unstable_cache(
    () => loadSitePageUncached(slug),
    [`site-page-${slug}`],
    {
      tags: [contentCacheTag(slug)],
      revalidate: 3600,
    },
  );

  const result = await cached();
  if (result) return result;
  return loadSitePageUncached(slug);
}

/**
 * Fetch compact, unique faculty options for admin teacher pickers.
 * Full profiles are deliberately loaded only after a selection changes.
 */
export async function fetchTeacherPickerOptions(): Promise<
  TeacherPickerOption[]
> {
  const cached = unstable_cache(
    async () => {
      const teacherPage = await db.page.findUnique({
        where: { slug: "teacher" },
        select: { id: true },
      });
      if (!teacherPage) return [];

      const people = await db.pagePerson.findMany({
        where: { pageId: teacherPage.id },
        select: { id: true, name: true, image: true, summary: true },
        orderBy: { sortOrder: "asc" },
      });
      const seen = new Set<string>();

      return people.flatMap((person) => {
        const name = person.name.trim();
        const slug = teacherSlug(name);
        const key = `${slug || name.toLocaleLowerCase()}`;
        if (!name || seen.has(person.id) || seen.has(key)) return [];
        seen.add(person.id);
        seen.add(key);
        return [
          {
            id: person.id,
            slug,
            name,
            image: person.image ?? undefined,
            role: person.summary ?? undefined,
          },
        ];
      });
    },
    ["admin-teacher-picker-options"],
    { tags: [contentCacheTag("teacher")], revalidate: 3600 },
  );

  return cached();
}

/**
 * Fetch full faculty profiles for only the teachers selected in the picker.
 *
 * @param ids - Stable page_people IDs selected by an editor
 */
export async function fetchTeacherPickerProfiles(
  ids: string[],
): Promise<SitePagePerson[]> {
  if (ids.length === 0) return [];
  const teacherPage = await db.page.findUnique({
    where: { slug: "teacher" },
    select: { id: true },
  });
  if (!teacherPage) return [];

  const people = await db.pagePerson.findMany({
    where: { pageId: teacherPage.id, id: { in: ids } },
    select: {
      id: true,
      name: true,
      image: true,
      summary: true,
      bio: true,
      education: true,
      experience: true,
      expertise: true,
    },
  });
  const byId = new Map(people.map((person) => [person.id, person]));

  return ids.flatMap((id) => {
    const person = byId.get(id);
    if (!person) return [];
    return [
      {
        name: person.name,
        image: person.image ?? undefined,
        summary: person.summary ?? undefined,
        bio: person.bio ?? undefined,
        education: Array.isArray(person.education as unknown[])
          ? (person.education as unknown[]).filter(
              (item): item is string => typeof item === "string",
            )
          : [],
        experience: Array.isArray(person.experience as unknown[])
          ? (person.experience as unknown[]).filter(
              (item): item is string => typeof item === "string",
            )
          : [],
        expertise: Array.isArray(person.expertise as unknown[])
          ? (person.expertise as unknown[]).filter(
              (item): item is string => typeof item === "string",
            )
          : [],
      },
    ];
  });
}

/**
 * Fetch a course document JSON blob from Postgres.
 *
 * @param slug - Course page slug
 */
async function loadCourseDocumentUncached<T>(slug: string): Promise<T | null> {
  const page = await db.page.findUnique({
    where: { slug },
    include: { courseDoc: true },
  });
  if (!page || !page.published || !page.courseDoc?.document) return null;
  return page.courseDoc.document as T;
}

/**
 * Fetch a course document JSON blob from Postgres with Next.js data cache.
 * Cache misses are re-checked live so publish/unpublish changes apply promptly.
 *
 * @param slug - Course page slug
 */
export async function fetchCourseDocumentFromDb<T>(
  slug: string,
): Promise<T | null> {
  const cached = unstable_cache(
    () => loadCourseDocumentUncached<T>(slug),
    [`course-doc-${slug}`],
    {
      tags: [contentCacheTag(slug)],
      revalidate: 3600,
    },
  );

  const result = await cached();
  if (result) return result;
  return loadCourseDocumentUncached<T>(slug);
}

/**
 * Loads page modules from Postgres (uncached).
 *
 * @param slug - Page slug
 */
async function loadPageModulesUncached(
  slug: string,
): Promise<PageModulesDocument | null> {
  const page = await db.page.findUnique({
    where: { slug },
    select: { pageModules: true, published: true },
  });
  if (!page || !page.published) return null;
  return mapPageModulesFromRow(page);
}

/**
 * Fetch page modules from Postgres with Next.js data cache.
 * Cache misses are re-checked live so newly published modules appear promptly.
 *
 * @param slug - Page slug
 */
export async function fetchPageModulesFromDb(
  slug: string,
): Promise<PageModulesDocument | null> {
  const cached = unstable_cache(
    () => loadPageModulesUncached(slug),
    [`page-modules-v3-${slug}`],
    {
      tags: [contentCacheTag(slug)],
      revalidate: 3600,
    },
  );

  const result = await cached();
  if (result) return result;
  return loadPageModulesUncached(slug);
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
      const post = await db.blogPost.findUnique({
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
      const posts = await db.blogPost.findMany({
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
    ["blog-posts-all-v3"],
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
      const record = await db.globalSettings.findUnique({ where: { key } });
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
 * @param type - Neon `PageType` value
 * @returns Slug strings ordered by title
 */
export async function fetchPageSlugsByTypeFromDb(
  type: "course" | "online" | "retreat" | "venue" | "site",
): Promise<string[]> {
  const cached = unstable_cache(
    async () => {
      const pages = await db.page.findMany({
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
      const posts = await db.blogPost.findMany({
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
