import type { PageType, Prisma } from "@prisma/client";
import { BLOG_POSTS } from "@/content/data/blog";
import {
  isNavPageRef,
  NAV_DROPDOWN_ENTRIES,
} from "@/content/data/navigation/entries";
import { ONLINE_COURSES } from "@/content/data/online-courses";
import sitePagesJson from "@/content/data/site-pages/site-pages.json";
import { getPageRef } from "@/content/pages/registry";
import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
} from "@/content/pages/slugs";
import type { SitePageDocument, SitePageSection } from "@/content/types";
import { COURSES_DATA } from "@/data/coursesData";
import { hashPassword } from "@/lib/cms/auth";
import { prisma } from "@/lib/db";
import { seedPageModulesOnly } from "./seed-page-modules";

function pageTypeForSlug(slug: string): PageType {
  const ref = getPageRef(slug);
  if (!ref) return "site";
  return ref.type as PageType;
}

async function upsertSitePageDocument(doc: SitePageDocument) {
  const type = pageTypeForSlug(doc.slug);

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

async function upsertCoursePage(
  slug: string,
  type: "course" | "online",
  document: object,
) {
  const title =
    "title" in document && typeof document.title === "string"
      ? document.title
      : slug;
  const image =
    "image" in document && typeof document.image === "string"
      ? document.image
      : "";

  const page = await prisma.page.upsert({
    where: { slug },
    create: {
      slug,
      type,
      title,
      description: "",
      image,
      eyebrow: type === "online" ? "Online Course" : "Yoga Teacher Training",
    },
    update: { type, title, image },
  });

  await prisma.courseDocument.upsert({
    where: { pageId: page.id },
    create: { pageId: page.id, document: document as Prisma.InputJsonValue },
    update: { document: document as Prisma.InputJsonValue },
  });
}

async function seedNavigation() {
  for (const [key, config] of Object.entries(NAV_DROPDOWN_ENTRIES)) {
    const group = await prisma.navigationGroup.upsert({
      where: { key },
      create: { key, label: key },
      update: { label: key },
    });

    await prisma.navigationItem.deleteMany({ where: { groupId: group.id } });

    const allItems = [...config.items];
    if (config.seeAll) allItems.push(config.seeAll);

    for (const item of allItems.sort((a, b) => a.sort - b.sort)) {
      if (isNavPageRef(item)) {
        await prisma.navigationItem.create({
          data: {
            groupId: group.id,
            sortOrder: item.sort,
            itemType: "page",
            pageType: item.type,
            pageSlug: item.slug,
          },
        });
      } else {
        await prisma.navigationItem.create({
          data: {
            groupId: group.id,
            sortOrder: item.sort,
            itemType: "static",
            href: item.href,
            label: item.label,
          },
        });
      }
    }
  }
}

async function main() {
  console.log("Seeding CMS database…");

  for (const slug of Object.keys(sitePagesJson)) {
    const doc = sitePagesJson[
      slug as keyof typeof sitePagesJson
    ] as SitePageDocument;
    if (
      RESIDENTIAL_COURSE_SLUGS.includes(
        slug as (typeof RESIDENTIAL_COURSE_SLUGS)[number],
      ) ||
      ONLINE_COURSE_SLUGS.includes(slug as (typeof ONLINE_COURSE_SLUGS)[number])
    ) {
      continue;
    }
    await upsertSitePageDocument(doc);
    console.log(`  site page: ${slug}`);
  }

  for (const slug of RESIDENTIAL_COURSE_SLUGS) {
    const course = COURSES_DATA[slug];
    if (!course) continue;
    await upsertCoursePage(slug, "course", course);
    console.log(`  course: ${slug}`);
  }

  for (const slug of ONLINE_COURSE_SLUGS) {
    const course = ONLINE_COURSES[slug];
    if (!course) continue;
    await upsertCoursePage(slug, "online", course);
    console.log(`  online: ${slug}`);
  }

  for (const post of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      create: {
        slug: post.slug,
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        image: post.image,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        content: post.content as Prisma.InputJsonValue,
      },
      update: {
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        image: post.image,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        content: post.content as Prisma.InputJsonValue,
      },
    });
    console.log(`  blog: ${post.slug}`);
  }

  await seedNavigation();
  console.log("  navigation: done");

  await seedPageModulesOnly();

  const adminEmail = "admin@nirvanayogaschoolindia.com";
  const passwordHash = await hashPassword("admin123");
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
    update: { passwordHash, role: "admin" },
  });
  console.log(`  admin user: ${adminEmail}`);

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
