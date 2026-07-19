/**
 * Adds only missing CMS records from the bundled content sources.
 * Existing rows and edited values are never updated or deleted.
 */
import { ONLINE_COURSES } from "@/content/data/online-courses";
import { isNavPageRef, NAV_DROPDOWN_ENTRIES } from "@/content/data/navigation/entries";
import sitePagesJson from "@/content/data/site-pages/site-pages.json";
import { ONLINE_COURSE_SLUGS, RESIDENTIAL_COURSE_SLUGS } from "@/content/pages/slugs";
import type { SitePageDocument } from "@/content/types";
import { COURSES_DATA } from "@/data/coursesData";
import { buildModulesFromCourse, buildModulesFromOnlineSlug } from "@/lib/cms/page-modules-builder";
import { db } from "@/lib/db/node";

type SeedCounts = Record<
  "pages" | "documents" | "modules" | "teachers" | "navigation",
  number
>;

/**
 * Creates a page and course document only when each is missing.
 *
 * @param slug - Course page slug
 * @param type - Course page type
 * @param document - Static course document
 * @param modules - Derived CMS modules for the page
 * @param counts - Mutable seed-result counters
 */
async function seedMissingCourse(
  slug: string,
  type: "course" | "online",
  document: object,
  modules: object,
  counts: SeedCounts,
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
  const existing = await db.page.findUnique({
    where: { slug },
    include: { courseDoc: true },
  });

  if (!existing) {
    const page = await db.page.create({
      data: {
        slug,
        type,
        title,
        image,
        description: "",
        eyebrow: type === "online" ? "Online Course" : "Yoga Teacher Training",
        pageModules: modules,
      },
    });
    await db.courseDocument.create({
      data: { pageId: page.id, document },
    });
    counts.pages++;
    counts.documents++;
    counts.modules++;
    return;
  }

  if (!existing.courseDoc) {
    await db.courseDocument.create({
      data: { pageId: existing.id, document },
    });
    counts.documents++;
  }
  if (existing.pageModules === null) {
    await db.page.update({
      where: { id: existing.id },
      data: { pageModules: modules },
    });
    counts.modules++;
  }
}

/**
 * Creates the teachers page and people only when absent or empty.
 *
 * @param counts - Mutable seed-result counters
 */
async function seedMissingTeachers(counts: SeedCounts) {
  const teacher = sitePagesJson.teacher as SitePageDocument;
  const existing = await db.page.findUnique({
    where: { slug: teacher.slug },
    include: { people: true },
  });

  if (!existing) {
    const page = await db.page.create({
      data: {
        slug: teacher.slug,
        type: "site",
        title: teacher.title,
        eyebrow: teacher.eyebrow,
        description: teacher.description,
        image: teacher.image,
        contentData: teacher.presentation ?? {},
      },
    });
    if (teacher.people?.length) {
      await db.pagePerson.createMany({
        data: teacher.people.map((person, sortOrder) => ({
          pageId: page.id,
          ...person,
          sortOrder,
          education: person.education ?? [],
          experience: person.experience ?? [],
          expertise: person.expertise ?? [],
        })),
      });
    }
    counts.pages++;
    counts.teachers += teacher.people?.length ?? 0;
    return;
  }

  if (existing.people.length === 0 && teacher.people?.length) {
    await db.pagePerson.createMany({
      data: teacher.people.map((person, sortOrder) => ({
        pageId: existing.id,
        ...person,
        sortOrder,
        education: person.education ?? [],
        experience: person.experience ?? [],
        expertise: person.expertise ?? [],
      })),
    });
    counts.teachers += teacher.people.length;
  }
}

/**
 * Adds missing dropdown navigation entries while leaving existing entries intact.
 *
 * @param counts - Mutable seed-result counters
 */
async function seedMissingNavigation(counts: SeedCounts) {
  for (const [key, config] of Object.entries(NAV_DROPDOWN_ENTRIES)) {
    const group = await db.navigationGroup.upsert({
      where: { key },
      create: { key, label: key },
      update: {},
    });
    const existing = await db.navigationItem.findMany({
      where: { groupId: group.id },
    });
    const items = [...config.items, ...(config.seeAll ? [config.seeAll] : [])];

    for (const item of items) {
      const present = isNavPageRef(item)
        ? existing.some(
            (entry) =>
              entry.itemType === "page" &&
              entry.pageType === item.type &&
              entry.pageSlug === item.slug,
          )
        : existing.some(
            (entry) =>
              entry.itemType === "static" &&
              entry.href === item.href &&
              entry.label === item.label,
          );
      if (present) continue;
      await db.navigationItem.create({
        data: isNavPageRef(item)
          ? {
              groupId: group.id,
              sortOrder: item.sort,
              itemType: "page",
              pageType: item.type,
              pageSlug: item.slug,
            }
          : {
              groupId: group.id,
              sortOrder: item.sort,
              itemType: "static",
              href: item.href,
              label: item.label,
            },
      });
      counts.navigation++;
    }
  }

}

async function main() {
  const counts: SeedCounts = {
    pages: 0,
    documents: 0,
    modules: 0,
    teachers: 0,
    navigation: 0,
  };

  await seedMissingTeachers(counts);

  for (const slug of RESIDENTIAL_COURSE_SLUGS) {
    const document = COURSES_DATA[slug];
    if (!document) continue;
    await seedMissingCourse(
      slug,
      "course",
      document,
      buildModulesFromCourse(document),
      counts,
    );
  }
  for (const slug of ONLINE_COURSE_SLUGS) {
    const document = ONLINE_COURSES[slug];
    if (!document) continue;
    await seedMissingCourse(
      slug,
      "online",
      document,
      buildModulesFromOnlineSlug(slug),
      counts,
    );
  }

  await seedMissingNavigation(counts);
  console.log("Missing CMS seed complete:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
