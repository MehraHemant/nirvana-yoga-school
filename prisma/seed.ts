import { PRIMARY_NAV, SIGN_IN_URL } from "@/constants/navigation";
import { BLOG_POSTS } from "@/content/data/blog";
import {
  DEFAULT_BOOKING_PAGE_CONTENT,
  DEFAULT_CONTACT_PAGE_CONTENT,
  DEFAULT_ENQUIRE_PAGE_CONTENT,
  DEFAULT_HOME_PAGE_CONTENT,
} from "@/content/data/dedicated-page-defaults";
import {
  isNavPageRef,
  NAV_DROPDOWN_ENTRIES,
} from "@/content/data/navigation/entries";
import { ONLINE_COURSES } from "@/content/data/online-courses";
import retreatsJson from "@/content/data/retreats/retreats.json";
import sitePagesJson from "@/content/data/site-pages/site-pages.json";
import { getPageRef } from "@/content/pages/registry";
import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
} from "@/content/pages/slugs";
import type { SitePageDocument, SitePageSection } from "@/content/types";
import { COURSES_DATA } from "@/data/coursesData";
import { syncDefaultContentTypes } from "@/lib/cms/content-types-sync";
import { prisma } from "@/lib/db/node";
import bcrypt from "bcryptjs";
import { seedPageModulesOnly } from "./seed-page-modules";

type PageType = "course" | "online" | "retreat" | "venue" | "site" | "blog";

function pageTypeForSlug(slug: string): PageType {
  const ref = getPageRef(slug);
  if (!ref) return "site";
  return ref.type as PageType;
}

async function upsertSitePageDocument(doc: SitePageDocument) {
  const type = pageTypeForSlug(doc.slug);
  const contentData =
    doc.slug === "teacher"
      ? {
          heroQuote:
            "Yoga Is A Light, Which Once Lit Will Never Dim. The Better Your Practice, The Brighter Your Flame.",
          heroLead: doc.description,
          sectionEyebrow: "Faculty profiles",
          sectionTitle: "Meet our gurus",
          sectionDescription:
            "Biography, education, experience, and areas of expertise for every member of our faculty.",
          homeEyebrow: "Our Spiritual Indian Gurus",
          homeTitle: "Lineage Teachers, Guided by Compassion",
          homeDescription:
            "Meet our experienced, traditional yoga teachers and spiritual guides carrying decades of combined practice directly from traditional Vedic lineages in Rishikesh.",
        }
      : {
          ...(doc.presentation ?? {}),
          ...(doc.meta ? { meta: doc.meta } : {}),
        };

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
      blocks: section.blocks ?? undefined,
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
  type: "course" | "online" | "retreat",
  document: object,
) {
  const title =
    "title" in document && typeof document.title === "string"
      ? document.title
      : slug;
  const image =
    "image" in document && typeof document.image === "string"
      ? document.image
      : "heroImage" in document && typeof document.heroImage === "string"
        ? document.heroImage
        : "";

  const page = await prisma.page.upsert({
    where: { slug },
    create: {
      slug,
      type,
      title,
      description: "",
      image,
      eyebrow:
        type === "online"
          ? "Online Course"
          : type === "retreat"
            ? "Retreat"
            : "Yoga Teacher Training",
    },
    update: { type, title, image },
  });

  await prisma.courseDocument.upsert({
    where: { pageId: page.id },
    create: { pageId: page.id, document },
    update: { document },
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

/**
 * Seeds header / footer / siteConfig / shared sections into `global_settings`.
 */
async function seedGlobalSettings() {
  const { buildSharedSectionSeeds } = await import("./seed-shared-sections");

  const defaults: Array<{ key: string; value: object }> = [
    {
      key: "header",
      value: {
        navigation: PRIMARY_NAV,
        logo: { light: "/logo.png", dark: "/logo_white.png" },
        ctas: [
          {
            label: "Sign in",
            href: SIGN_IN_URL,
            variant: "link",
            sort: 0,
          },
          {
            label: "Enquire Now",
            href: "/enquire-now",
            variant: "primary",
            sort: 10,
          },
        ],
        // Legacy mirrors for older readers
        signInUrl: SIGN_IN_URL,
        cta: {
          label: "Enquire Now",
          href: "/enquire-now",
          variant: "primary",
        },
      },
    },
    {
      key: "footer",
      value: {
        brand: {
          logo: "/logo.png",
          tagline:
            "A residential sanctuary for seekers — where classical Hatha, philosophy, and meditation converge on the sacred banks of the Ganga.",
          credentials: "Yoga Alliance RYS · Est. 2012 · Tapovan, Rishikesh",
        },
        social: [
          {
            label: "Instagram",
            href: "https://www.instagram.com/nirvanayogaschool",
            icon: "instagram",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@nirvanayogaschool",
            icon: "youtube",
          },
          {
            label: "Facebook",
            href: "https://www.facebook.com/nirvanayogaschool",
            icon: "facebook",
          },
          {
            label: "WhatsApp",
            href: "https://wa.me/919876543210",
            icon: "whatsapp",
          },
        ],
        columns: [
          {
            heading: "Programs",
            links: [
              {
                label: "200-Hour YTT",
                href: "/course/200-hour-yoga-teacher-training-in-rishikesh-india",
              },
              {
                label: "Online Courses",
                href: "/online-yoga-teacher-training-courses",
              },
              {
                label: "Retreats",
                href: "/retreat/3-day-yoga-retreat-in-rishikesh-india",
              },
            ],
          },
          {
            heading: "School",
            links: [
              { label: "About", href: "/#about" },
              { label: "Teachers", href: "/teacher" },
              { label: "Contact", href: "/contact" },
            ],
          },
        ],
        contact: {
          address: "Tapovan, Rishikesh, Uttarakhand 249192, India",
          email: "hello@nirvanayogaschoolindia.com",
          phone: "+91 98765 43210",
        },
        legal: [
          { label: "Privacy", href: "#" },
          { label: "Terms", href: "#" },
        ],
      },
    },
    {
      key: "siteConfig",
      value: {
        siteName: "Nirvana Yoga School",
        siteUrl: "https://www.nirvanayogaschoolindia.com",
        defaultSeo: {
          title:
            "Nirvana Yoga School — Yoga Teacher Training in Rishikesh, India",
          description:
            "Residential yoga teacher training courses (200/300/500-hour), retreats, and online programs. Yoga Alliance certified. Est. 2012 in Rishikesh.",
          ogImage: "/logo.png",
        },
        whatsappNumber: "919876543210",
        contactEmail: "hello@nirvanayogaschoolindia.com",
        contactPhone: "+91 98765 43210",
        address: "Tapovan, Rishikesh, Uttarakhand 249192, India",
      },
    },
    ...buildSharedSectionSeeds(),
  ];

  for (const row of defaults) {
    await prisma.globalSettings.upsert({
      where: { key: row.key },
      create: row,
      update: { value: row.value },
    });
    console.log(`  global_settings: ${row.key}`);
  }
}

/**
 * Deletes all rows from a table when it exists (Hostinger-safe).
 *
 * @param table - MySQL table name
 */
async function clearTableIfExists(table: string) {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS c FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    table,
  )) as Array<{ c: bigint | number }>;
  const count = Number(rows[0]?.c ?? 0);
  if (count === 0) return;
  await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\``);
}

/**
 * Retries a DB write on Hostinger deadlocks / transient disconnects.
 *
 * @param label - Log label for the operation
 * @param fn - Async write
 * @param attempts - Max tries
 */
async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 5,
): Promise<T> {
  let last: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: string }).code)
          : "";
      const retryable =
        code === "P2034" ||
        code === "P1001" ||
        code === "P1017" ||
        (error instanceof Error &&
          error.message.includes("Can't reach database server"));
      if (!retryable || i === attempts) throw error;
      const waitMs = 1500 * i;
      console.warn(`  retry ${i}/${attempts} ${label} (${code || "error"})…`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw last;
}

async function main() {
  console.log("Seeding CMS database…");

  // Wipe rows (not DROP) so a re-seed never requires migrate again.
  // Order respects FKs; missing tables are skipped (empty Hostinger DB).
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of [
    "content_references",
    "content_items",
    "global_settings",
    "bookings",
    "lead_submissions",
    "module_library_items",
    "content_revisions",
    "media_assets",
    "blog_posts",
    "navigation_items",
    "navigation_groups",
    "subsection_items",
    "section_items",
    "section_subsections",
    "page_sections",
    "page_packages",
    "page_gallery_images",
    "page_cards",
    "page_people",
    "page_highlights",
    "course_documents",
    "pages",
    "content_types",
    "admin_users",
  ]) {
    await clearTableIfExists(table);
  }
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
  console.log("  wiped existing CMS rows");

  await syncDefaultContentTypes(prisma);
  console.log("  content types: synced");

  await seedGlobalSettings();

  // Dedicated pages — content_data typed docs.
  for (const row of [
    {
      slug: "home",
      title: "Home",
      description:
        "Yoga teacher training in Rishikesh — residential, online, and retreats.",
      contentData: DEFAULT_HOME_PAGE_CONTENT,
    },
    {
      slug: "contact",
      title: "Contact",
      description: "Get in touch with Nirvana Yoga School in Rishikesh.",
      contentData: DEFAULT_CONTACT_PAGE_CONTENT,
    },
    {
      slug: "enquire-now",
      title: "Enquire Now",
      description: "Enquire about yoga teacher training, retreats, and courses.",
      contentData: DEFAULT_ENQUIRE_PAGE_CONTENT,
    },
    {
      slug: "booking",
      title: "Booking",
      description:
        "Book your yoga teacher training and pay a deposit securely.",
      contentData: DEFAULT_BOOKING_PAGE_CONTENT,
    },
  ] as const) {
    await withRetry(`${row.slug} page`, () =>
      prisma.page.upsert({
        where: { slug: row.slug },
        create: {
          slug: row.slug,
          type: "site",
          title: row.title,
          eyebrow: "Nirvana Yoga School",
          description: row.description,
          image: "",
          published: true,
          contentData: row.contentData,
          pageModules: {},
        },
        update: {
          title: row.title,
          type: "site",
          published: true,
          contentData: row.contentData,
        },
      }),
    );
    console.log(`  site page: ${row.slug}`);
  }

  const dedicatedSiteSlugs = new Set([
    "home",
    "contact",
    "enquire-now",
    "booking",
  ]);
  for (const slug of Object.keys(sitePagesJson)) {
    const doc = sitePagesJson[
      slug as keyof typeof sitePagesJson
    ] as SitePageDocument;
    if (
      dedicatedSiteSlugs.has(slug) ||
      RESIDENTIAL_COURSE_SLUGS.includes(
        slug as (typeof RESIDENTIAL_COURSE_SLUGS)[number],
      ) ||
      ONLINE_COURSE_SLUGS.includes(slug as (typeof ONLINE_COURSE_SLUGS)[number])
    ) {
      continue;
    }
    await withRetry(`site page ${slug}`, () => upsertSitePageDocument(doc));
    console.log(`  site page: ${slug}`);
  }

  for (const slug of RESIDENTIAL_COURSE_SLUGS) {
    const course = COURSES_DATA[slug];
    if (!course) continue;
    await withRetry(`course ${slug}`, () =>
      upsertCoursePage(slug, "course", course),
    );
    console.log(`  course: ${slug}`);
  }

  for (const slug of ONLINE_COURSE_SLUGS) {
    const course = ONLINE_COURSES[slug];
    if (!course) continue;
    await withRetry(`online ${slug}`, () =>
      upsertCoursePage(slug, "online", course),
    );
    console.log(`  online: ${slug}`);
  }

  for (const retreat of retreatsJson.retreats) {
    await withRetry(`retreat ${retreat.slug}`, () =>
      upsertCoursePage(retreat.slug, "retreat", retreat),
    );
    console.log(`  retreat: ${retreat.slug}`);
  }

  for (const post of BLOG_POSTS) {
    await withRetry(`blog ${post.slug}`, () =>
      prisma.blogPost.upsert({
        where: { slug: post.slug },
        create: {
          slug: post.slug,
          title: post.title,
          category: post.category,
          excerpt: post.excerpt,
          image: post.image,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          content: post.content,
        },
        update: {
          title: post.title,
          category: post.category,
          excerpt: post.excerpt,
          image: post.image,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          content: post.content,
        },
      }),
    );
    console.log(`  blog: ${post.slug}`);
  }

  await withRetry("navigation", () => seedNavigation());
  console.log("  navigation: done");

  await withRetry("page modules", () => seedPageModulesOnly());

  const adminEmail = "admin@nirvanayogaschoolindia.com";
  const passwordHash = await bcrypt.hash("admin123", 12);
  await withRetry("admin user", () =>
    prisma.adminUser.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        passwordHash,
        role: "admin",
      },
      update: { passwordHash, role: "admin" },
    }),
  );
  console.log(`  admin user: ${adminEmail}`);

  const teacherPage = await prisma.page.findUnique({
    where: { slug: "teacher" },
  });
  if (!teacherPage) {
    throw new Error('Teacher page was not seeded from "site-pages.json".');
  }
  const peopleCount = await prisma.pagePerson.count({
    where: { page: { slug: "teacher" } },
  });
  console.log(
    `  teacher page: ok (${peopleCount} people)`,
  );

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
