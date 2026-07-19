/**
 * Writes retreat-specific lodging/food (`residentialLife`) onto product retreat
 * page modules. Fixes pages that were falling back to the YTT course set.
 *
 * Usage: npx tsx --env-file=.env scripts/sync-retreat-residential-life.ts
 */
import { createRetreatResidentialLife } from "../src/content/data/retreat-residential-life";
import { retreatAccommodationToResidentialLife } from "../src/content/mappers/residential-life";
import type { PageModulesDocument } from "../src/content/types";
import type { RetreatAccommodationContent } from "../src/content/types/shared-sections";
import { db } from "../src/lib/db/node";

const RETREAT_SLUGS = [
  "3-day-yoga-retreat-in-rishikesh-india",
  "5-day-yoga-retreat-in-rishikesh-india",
  "7-day-yoga-retreat-in-rishikesh-india",
] as const;

async function resolveRetreatResidentialLife() {
  const row = await db.globalSettings.findUnique({
    where: { key: "retreatAccommodation" },
  });
  const raw = row?.value as RetreatAccommodationContent | null | undefined;
  if (raw?.roomGalleries?.length) {
    return retreatAccommodationToResidentialLife(raw);
  }
  return createRetreatResidentialLife();
}

async function main() {
  const residentialLife = await resolveRetreatResidentialLife();
  console.log(
    "Using retreat lodging galleries:",
    residentialLife.accommodation.galleries.map((g) => g.label).join(", "),
  );

  for (const slug of RETREAT_SLUGS) {
    const page = await db.page.findUnique({
      where: { slug },
      select: { id: true, slug: true, pageModules: true },
    });
    if (!page) {
      console.warn(`  skip (no page): ${slug}`);
      continue;
    }

    const existing = (page.pageModules ?? {}) as PageModulesDocument;
    const next: PageModulesDocument = {
      ...existing,
      residentialLife,
      flags: {
        showExam: existing.flags?.showExam ?? false,
        showAccommodation: true,
        showWhyNirvana: existing.flags?.showWhyNirvana ?? true,
        showTravel: existing.flags?.showTravel ?? true,
        showInstagram: existing.flags?.showInstagram ?? true,
        showMap: existing.flags?.showMap ?? true,
      },
    };
    // Drop legacy key so the course-compatible shape is authoritative.
    delete next.retreatAccommodation;

    await db.page.update({
      where: { slug },
      data: { pageModules: next },
    });
    console.log(`  updated: ${slug}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
