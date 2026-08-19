import { revalidatePath, revalidateTag } from "next/cache";
import { getPageRef } from "@/content/pages/registry";
import { upsertPageSeo } from "@/content/repositories/page-seo";
import { teacherSlug } from "@/content/teachers-slug";
import type {
  BlogPostDocument,
  CourseDocument,
  OnlineCourseDocument,
  PageModulesDocument,
  SitePageDocument,
  SitePageSection,
} from "@/content/types";
import {
  invalidateAndRevalidatePage,
  invalidateContentCache,
} from "@/lib/cms/cache";
import {
  buildModulesFromCourse,
  buildModulesFromOnlineCourse,
  syncPageFieldsFromModules,
} from "@/lib/cms/page-modules-builder";
import { allocateUniqueSlug, slugifyText } from "@/lib/cms/unique-slug";
import { type DbClient, db } from "@/lib/db";

/**
 * Upsert a `SitePageDocument` and all child rows from admin API input.
 *
 * @param doc - Full site page document
 */
/**
 * Builds `content_data` JSON for site pages (presentation copy + optional SEO).
 *
 * @param doc - Site page document from admin
 */
function sitePageContentData(doc: SitePageDocument): Record<string, unknown> {
  return {
    ...(doc.presentation ?? {}),
    ...(doc.meta ? { meta: doc.meta } : {}),
  };
}

/**
 * Keeps the canonical faculty store unique by its public selection identity.
 *
 * @param people - Teacher profile rows submitted by the faculty editor
 */
function uniqueTeacherPeople(
  people: NonNullable<SitePageDocument["people"]>,
): NonNullable<SitePageDocument["people"]> {
  const seen = new Set<string>();
  return people.flatMap((person) => {
    const name = person.name.trim();
    const identity = teacherSlug(name) || name.toLocaleLowerCase();
    if (!name || seen.has(identity)) return [];
    seen.add(identity);
    return [{ ...person, name }];
  });
}

/**
 * Upsert a `SitePageDocument` and all child rows from admin API input.
 *
 * @param doc - Full site page document
 */
export async function upsertSitePageDocument(doc: SitePageDocument) {
  const ref = getPageRef(doc.slug);
  const type = ref?.type ?? "site";
  const contentData = sitePageContentData(doc);
  const page = await db.page.upsert({
    where: { slug: doc.slug },
    create: {
      slug: doc.slug,
      type,
      eyebrow: doc.eyebrow,
      title: doc.title,
      description: doc.description,
      image: doc.image,
      ctaLabel: doc.ctaLabel,
      ctaHref: doc.ctaHref,
      published: true,
      contentData,
    },
    update: {
      type,
      eyebrow: doc.eyebrow,
      title: doc.title,
      description: doc.description,
      image: doc.image,
      ctaLabel: doc.ctaLabel,
      ctaHref: doc.ctaHref,
      contentData,
    },
    select: { id: true, type: true },
  });

  await db.$transaction(async (tx) => {
    await Promise.all([
      tx.pageSection.deleteMany({ where: { pageId: page.id } }),
      tx.pagePackage.deleteMany({ where: { pageId: page.id } }),
      tx.pageGalleryImage.deleteMany({ where: { pageId: page.id } }),
      tx.pageCard.deleteMany({ where: { pageId: page.id } }),
      tx.pagePerson.deleteMany({ where: { pageId: page.id } }),
      tx.pageHighlight.deleteMany({ where: { pageId: page.id } }),
    ]);

    for (const [index, section] of doc.sections.entries()) {
      await createSection(page.id, index, section, tx);
    }

    const packages = doc.packages ?? [];
    if (packages.length > 0) {
      await tx.pagePackage.createMany({
        data: packages.map((pkg, index) => ({
          pageId: page.id,
          sortOrder: index,
          title: pkg.title,
          price: pkg.price,
          image: pkg.image,
        })),
      });
    }

    const gallery = doc.gallery ?? [];
    if (gallery.length > 0) {
      await tx.pageGalleryImage.createMany({
        data: gallery.map((image, index) => ({
          pageId: page.id,
          sortOrder: index,
          url: image.url,
          category: image.category,
        })),
      });
    }

    const cards = doc.cards ?? [];
    if (cards.length > 0) {
      await tx.pageCard.createMany({
        data: cards.map((card, index) => ({
          pageId: page.id,
          sortOrder: index,
          title: card.title,
          description: card.description,
          href: card.href,
        })),
      });
    }

    const people =
      doc.slug === "teacher"
        ? uniqueTeacherPeople(doc.people ?? [])
        : (doc.people ?? []);
    if (people.length > 0) {
      await tx.pagePerson.createMany({
        data: people.map((person, index) => ({
          pageId: page.id,
          sortOrder: index,
          name: person.name,
          image: person.image,
          summary: person.summary,
          bio: person.bio,
          education: person.education ?? [],
          experience: person.experience ?? [],
          expertise: person.expertise ?? [],
        })),
      });
    }

    const highlights = doc.highlights ?? [];
    if (highlights.length > 0) {
      await tx.pageHighlight.createMany({
        data: highlights.map((highlight, index) => ({
          pageId: page.id,
          sortOrder: index,
          title: highlight.title,
          description: highlight.description,
          image: highlight.image,
        })),
      });
    }
  });

  invalidateAndRevalidatePage(doc.slug, page.type);
  await upsertPageSeo(doc.slug, doc.meta).catch((error) => {
    console.error("[document-to-db] page SEO sync failed", error);
  });
  return page;
}

/**
 * Upsert page modules JSON and sync listing metadata from hero.
 * Prefers a lean `update` (pages already exist) and avoids returning the JSON blob.
 *
 * @param slug - Page slug
 * @param modules - Full module document
 */
export async function upsertPageModules(
  slug: string,
  modules: PageModulesDocument,
) {
  const ref = getPageRef(slug);
  const type = ref?.type ?? "site";
  const fields = syncPageFieldsFromModules(modules);
  const data = {
    type: type as never,
    eyebrow: fields.eyebrow,
    title: fields.title,
    description: fields.description,
    image: fields.image,
    fee: fields.fee,
    duration: fields.duration,
    pageModules: modules,
  };

  const existing = await db.page.findUnique({
    where: { slug },
    select: { id: true },
  });

  const page = existing
    ? await db.page.update({
        where: { id: existing.id },
        data,
        select: { id: true, type: true },
      })
    : await db.page.create({
        data: { slug, ...data },
        select: { id: true, type: true },
      });

  // Keep relational gallery rows in sync (venue admin edits modules.gallery).
  if (modules.gallery) {
    await db.pageGalleryImage.deleteMany({ where: { pageId: page.id } });
    const images = modules.gallery.images ?? [];
    if (images.length > 0) {
      await db.pageGalleryImage.createMany({
        data: images.map((image, index) => ({
          pageId: page.id,
          url: image.url,
          category: image.category || "general",
          sortOrder: index * 10,
          mediaAssetId: image.mediaAssetId ?? undefined,
        })),
      });
    }
  }

  invalidateAndRevalidatePage(slug, page.type);

  await upsertPageSeo(slug, modules.meta).catch((error) => {
    console.error("[document-to-db] page SEO sync failed", error);
  });

  return page;
}

/**
 * Build and persist page modules from legacy course document.
 *
 * @param course - Course document
 * @param pageType - Page type
 */
export async function seedCourseModulesFromDocument(
  course: CourseDocument,
  pageType: "course" | "online" = "course",
) {
  const modules =
    pageType === "online"
      ? buildModulesFromOnlineCourse(course as OnlineCourseDocument)
      : buildModulesFromCourse(course);

  return upsertPageModules(course.slug, modules);
}

/**
 * Creates one page section and its nested items/subsections.
 *
 * @param pageId - Parent page id
 * @param sortOrder - Section order
 * @param section - Section document
 * @param db - DB client or transaction client
 */
async function createSection(
  pageId: string,
  sortOrder: number,
  section: SitePageSection,
  database: DbClient = db,
) {
  const created = await database.pageSection.create({
    data: {
      pageId,
      sortOrder,
      title: section.title,
      eyebrow: section.eyebrow,
      body: section.body,
      layout: section.layout ?? "default",
      image: section.image,
      images: section.images ?? [],
      blocks: section.blocks ?? undefined,
    },
  });

  const items = section.items ?? [];
  if (items.length > 0) {
    await database.sectionItem.createMany({
      data: items.map((value, index) => ({
        sectionId: created.id,
        sortOrder: index,
        value,
      })),
    });
  }

  for (const [index, subsection] of (section.subsections ?? []).entries()) {
    const sub = await database.sectionSubsection.create({
      data: {
        sectionId: created.id,
        sortOrder: index,
        title: subsection.title,
        body: subsection.body,
        image: subsection.image,
      },
    });

    const subItems = subsection.items ?? [];
    if (subItems.length > 0) {
      await database.subsectionItem.createMany({
        data: subItems.map((value, itemIndex) => ({
          subsectionId: sub.id,
          sortOrder: itemIndex,
          value,
        })),
      });
    }
  }
}

/**
 * Upsert a course document JSON blob and sync page metadata.
 *
 * @param doc - Full course document
 * @param pageType - `course` or `online`
 */
export async function upsertCourseDocument(
  doc: CourseDocument,
  pageType: "course" | "online" = "course",
) {
  const page = await db.page.upsert({
    where: { slug: doc.slug },
    create: {
      slug: doc.slug,
      type: pageType,
      title: doc.title,
      description: doc.subtitle,
      image: doc.image,
      eyebrow:
        pageType === "online" ? "Online Course" : "Yoga Teacher Training",
    },
    update: {
      type: pageType,
      title: doc.title,
      description: doc.subtitle,
      image: doc.image,
    },
  });

  await db.courseDocument.upsert({
    where: { pageId: page.id },
    create: {
      pageId: page.id,
      document: doc,
    },
    update: {
      document: doc,
    },
  });

  invalidateAndRevalidatePage(doc.slug, pageType);
  return page;
}

/**
 * Upsert a retreat (or other product) JSON document on `course_documents`.
 *
 * @param slug - Page slug
 * @param pageType - Product page type
 * @param document - Serializable product document
 * @param meta - Optional title/image overrides
 */
export async function upsertProductDocument(
  slug: string,
  pageType: "course" | "online" | "retreat",
  document: object,
  meta?: { title?: string; image?: string; description?: string },
) {
  const title =
    meta?.title ??
    ("title" in document && typeof document.title === "string"
      ? document.title
      : slug);
  const image =
    meta?.image ??
    ("image" in document && typeof document.image === "string"
      ? document.image
      : "heroImage" in document && typeof document.heroImage === "string"
        ? document.heroImage
        : "");
  const description =
    meta?.description ??
    ("description" in document && typeof document.description === "string"
      ? document.description
      : "subtitle" in document && typeof document.subtitle === "string"
        ? document.subtitle
        : "");

  const page = await db.page.upsert({
    where: { slug },
    create: {
      slug,
      type: pageType,
      title,
      description,
      image,
      eyebrow:
        pageType === "online"
          ? "Online Course"
          : pageType === "retreat"
            ? "Retreat"
            : "Yoga Teacher Training",
    },
    update: { type: pageType, title, description, image },
  });

  await db.courseDocument.upsert({
    where: { pageId: page.id },
    create: { pageId: page.id, document },
    update: { document },
  });

  invalidateAndRevalidatePage(slug, pageType);
  return page;
}

/**
 * Creates a new blog post with optional full document fields.
 *
 * @param input - Title, optional slug override, and editor fields
 */
export async function createBlogPostDraft(input: {
  title: string;
  slug?: string;
  category?: string;
  excerpt?: string;
  image?: string;
  bodyHtml?: string | null;
  content?: BlogPostDocument["content"];
  published?: boolean;
  publishedAt?: string | null;
}) {
  const title = input.title.trim() || "Untitled post";
  const baseSlug =
    slugifyText(input.slug?.trim() ?? "") ||
    slugifyText(title) ||
    `post-${Date.now()}`;

  const slug = await allocateUniqueSlug(baseSlug, async (candidate) => {
    const existing = await db.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(existing);
  });

  const published = input.published ?? false;
  const publishedAt = input.publishedAt
    ? new Date(input.publishedAt)
    : published
      ? new Date()
      : null;

  const post = await db.blogPost.create({
    data: {
      slug,
      title,
      category: input.category?.trim() ?? "",
      excerpt: input.excerpt?.trim() ?? "",
      image: input.image?.trim() ?? "",
      publishedAt,
      content: input.content ?? [],
      bodyHtml: input.bodyHtml?.trim() ? input.bodyHtml : null,
      published,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${post.slug}`);
  revalidatePath("/blog");
  return post;
}

/**
 * Upsert a blog post document.
 *
 * @param doc - Full blog post document
 */
export async function upsertBlogPost(doc: BlogPostDocument) {
  const published = doc.published ?? false;
  const publishedAt = doc.publishedAt
    ? new Date(doc.publishedAt)
    : published
      ? new Date()
      : null;

  const post = await db.blogPost.upsert({
    where: { slug: doc.slug },
    create: {
      slug: doc.slug,
      title: doc.title,
      category: doc.category,
      excerpt: doc.excerpt,
      image: doc.image,
      publishedAt,
      content: doc.content,
      bodyHtml: doc.bodyHtml ?? null,
      published,
    },
    update: {
      title: doc.title,
      category: doc.category,
      excerpt: doc.excerpt,
      image: doc.image,
      publishedAt,
      content: doc.content,
      bodyHtml: doc.bodyHtml ?? null,
      published,
    },
  });

  invalidateContentCache(doc.slug);
  revalidateTag("blog:all", "max");
  return post;
}

/**
 * Hard-delete a blog post and invalidate related caches.
 *
 * @param slug - Blog post slug
 * @returns Whether a post was deleted
 */
export async function deleteBlogPost(slug: string): Promise<boolean> {
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return false;

  await db.blogPost.delete({ where: { slug } });

  invalidateContentCache(slug);
  revalidateTag("blog:all", "max");
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${slug}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return true;
}

/**
 * Unpublish a page by slug (soft delete).
 *
 * @param slug - Page slug
 */
export async function unpublishPage(slug: string): Promise<void> {
  const page = await db.page.findUnique({
    where: { slug },
    select: { type: true },
  });
  if (!page) return;

  await db.page.update({
    where: { slug },
    data: { published: false },
  });

  invalidateAndRevalidatePage(slug, page.type);
  revalidatePath(`/admin/pages/${slug}`);
  revalidatePath("/admin/pages");
}
