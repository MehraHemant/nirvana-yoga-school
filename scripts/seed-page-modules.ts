import { COURSES_MEDIA } from "@/content/data/media";
import retreatsJson from "@/content/data/retreats/retreats.json";
import sitePagesJson from "@/content/data/site-pages/site-pages.json";
import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  VENUE_SLUGS,
} from "@/content/pages/slugs";
import type { SitePageDocument } from "@/content/types";
import { COURSES_DATA } from "@/data/coursesData";
import {
  buildModulesFromCourse,
  buildModulesFromOnlineSlug,
  buildModulesFromRetreat,
  buildModulesFromSitePage,
} from "@/lib/cms/page-modules-builder";
import { db } from "@/lib/db/node";

/**
 * Populate `page_modules` for all existing page rows.
 */
export async function seedPageModulesOnly() {
  console.log("Seeding page modules…");

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

    const isVenue = VENUE_SLUGS.includes(slug as (typeof VENUE_SLUGS)[number]);
    const isHub = slug.includes("teacher-training") || slug.includes("retreat");
    const modules = buildModulesFromSitePage(doc, { isVenue, isHub });

    await db.page.update({
      where: { slug },
      data: { pageModules: modules },
    });
    console.log(`  modules site: ${slug}`);
  }

  for (const slug of RESIDENTIAL_COURSE_SLUGS) {
    const course = COURSES_DATA[slug];
    if (!course) continue;
    const media = COURSES_MEDIA[slug];
    const modules = buildModulesFromCourse(course, media);
    await db.page.update({
      where: { slug },
      data: { pageModules: modules },
    });
    console.log(`  modules course: ${slug}`);
  }

  for (const slug of ONLINE_COURSE_SLUGS) {
    try {
      const modules = buildModulesFromOnlineSlug(slug);
      await db.page.update({
        where: { slug },
        data: { pageModules: modules },
      });
      console.log(`  modules online: ${slug}`);
    } catch {
      console.warn(`  skip online modules: ${slug}`);
    }
  }

  for (const retreat of retreatsJson.retreats) {
    const modules = buildModulesFromRetreat(retreat);
    try {
      await db.page.update({
        where: { slug: retreat.slug },
        data: { pageModules: modules },
      });
      console.log(`  modules retreat: ${retreat.slug}`);
    } catch {
      console.warn(`  skip retreat modules (no page row): ${retreat.slug}`);
    }
  }
}
