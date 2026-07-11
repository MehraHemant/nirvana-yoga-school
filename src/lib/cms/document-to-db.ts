import type { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { getPageRef } from "@/content/pages/registry";
import type {
  BlogPostDocument,
  CourseDocument,
  OnlineCourseDocument,
  PageModulesDocument,
  SitePageDocument,
  SitePageSection,
} from "@/content/types";
import { invalidateContentCache } from "@/lib/cms/cache";
import {
  buildModulesFromCourse,
  buildModulesFromOnlineCourse,
  buildModulesFromOnlineSlug,
  buildModulesFromRetreat,
  buildModulesFromSitePage,
  syncPageFieldsFromModules,
} from "@/lib/cms/page-modules-builder";
import { prisma } from "@/lib/db";

/**
 * Upsert a `SitePageDocument` and all child rows from admin API input.
 *
 * @param doc - Full site page document
 */
export async function upsertSitePageDocument(doc: SitePageDocument) {
  const ref = getPageRef(doc.slug);
  const type = ref?.type ?? "site";
  const page = await prisma.page.upsert({
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
    },
    update: {
      type,
      eyebrow: doc.eyebrow,
      title: doc.title,
      description: doc.description,
      image: doc.image,
      ctaLabel: doc.ctaLabel,
      ctaHref: doc.ctaHref,
    },
  });

  await prisma.pageSection.deleteMany({ where: { pageId: page.id } });
  await prisma.pagePackage.deleteMany({ where: { pageId: page.id } });
  await prisma.pageGalleryImage.deleteMany({ where: { pageId: page.id } });
  await prisma.pageCard.deleteMany({ where: { pageId: page.id } });
  await prisma.pagePerson.deleteMany({ where: { pageId: page.id } });
  await prisma.pageHighlight.deleteMany({ where: { pageId: page.id } });

  for (const [index, section] of doc.sections.entries()) {
    await createSection(page.id, index, section);
  }

  for (const [index, pkg] of (doc.packages ?? []).entries()) {
    await prisma.pagePackage.create({
      data: {
        pageId: page.id,
        sortOrder: index,
        title: pkg.title,
        price: pkg.price,
        image: pkg.image,
      },
    });
  }

  for (const [index, image] of (doc.gallery ?? []).entries()) {
    await prisma.pageGalleryImage.create({
      data: {
        pageId: page.id,
        sortOrder: index,
        url: image.url,
        category: image.category,
      },
    });
  }

  for (const [index, card] of (doc.cards ?? []).entries()) {
    await prisma.pageCard.create({
      data: {
        pageId: page.id,
        sortOrder: index,
        title: card.title,
        description: card.description,
        href: card.href,
      },
    });
  }

  for (const [index, person] of (doc.people ?? []).entries()) {
    await prisma.pagePerson.create({
      data: {
        pageId: page.id,
        sortOrder: index,
        name: person.name,
        image: person.image,
        summary: person.summary,
        bio: person.bio,
        education: person.education ?? [],
        experience: person.experience ?? [],
        expertise: person.expertise ?? [],
      },
    });
  }

  for (const [index, highlight] of (doc.highlights ?? []).entries()) {
    await prisma.pageHighlight.create({
      data: {
        pageId: page.id,
        sortOrder: index,
        title: highlight.title,
        description: highlight.description,
        image: highlight.image,
      },
    });
  }

  invalidateContentCache(doc.slug);
  return page;
}

/**
 * Upsert page modules JSON and sync listing metadata from hero.
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

  const page = await prisma.page.upsert({
    where: { slug },
    create: {
      slug,
      type,
      eyebrow: fields.eyebrow,
      title: fields.title,
      description: fields.description,
      image: fields.image,
      pageModules: modules as Prisma.InputJsonValue,
    },
    update: {
      type,
      eyebrow: fields.eyebrow,
      title: fields.title,
      description: fields.description,
      image: fields.image,
      pageModules: modules as Prisma.InputJsonValue,
    },
  });

  invalidateContentCache(slug);
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

async function createSection(
  pageId: string,
  sortOrder: number,
  section: SitePageSection,
) {
  const created = await prisma.pageSection.create({
    data: {
      pageId,
      sortOrder,
      title: section.title,
      eyebrow: section.eyebrow,
      body: section.body,
      layout: section.layout ?? "default",
      image: section.image,
      images: section.images ?? [],
      blocks: section.blocks
        ? (section.blocks as Prisma.InputJsonValue)
        : undefined,
    },
  });

  for (const [index, item] of (section.items ?? []).entries()) {
    await prisma.sectionItem.create({
      data: { sectionId: created.id, sortOrder: index, value: item },
    });
  }

  for (const [index, subsection] of (section.subsections ?? []).entries()) {
    const sub = await prisma.sectionSubsection.create({
      data: {
        sectionId: created.id,
        sortOrder: index,
        title: subsection.title,
        body: subsection.body,
        image: subsection.image,
      },
    });

    for (const [itemIndex, item] of (subsection.items ?? []).entries()) {
      await prisma.subsectionItem.create({
        data: {
          subsectionId: sub.id,
          sortOrder: itemIndex,
          value: item,
        },
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
  const page = await prisma.page.upsert({
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

  await prisma.courseDocument.upsert({
    where: { pageId: page.id },
    create: {
      pageId: page.id,
      document: doc as Prisma.InputJsonValue,
    },
    update: {
      document: doc as Prisma.InputJsonValue,
    },
  });

  invalidateContentCache(doc.slug);
  return page;
}

/**
 * Upsert a blog post document.
 *
 * @param doc - Full blog post document
 */
export async function upsertBlogPost(doc: BlogPostDocument) {
  const publishedAt = doc.publishedAt ? new Date(doc.publishedAt) : null;

  const post = await prisma.blogPost.upsert({
    where: { slug: doc.slug },
    create: {
      slug: doc.slug,
      title: doc.title,
      category: doc.category,
      excerpt: doc.excerpt,
      image: doc.image,
      publishedAt,
      content: doc.content as Prisma.InputJsonValue,
      bodyHtml: doc.bodyHtml ?? null,
    },
    update: {
      title: doc.title,
      category: doc.category,
      excerpt: doc.excerpt,
      image: doc.image,
      publishedAt,
      content: doc.content as Prisma.InputJsonValue,
      bodyHtml: doc.bodyHtml ?? null,
    },
  });

  invalidateContentCache(doc.slug);
  revalidateTag("blog:all", "max");
  return post;
}

/**
 * Unpublish a page by slug (soft delete).
 *
 * @param slug - Page slug
 */
export async function unpublishPage(slug: string): Promise<void> {
  await prisma.page.update({
    where: { slug },
    data: { published: false },
  });
  invalidateContentCache(slug);
}
