import type { ModuleLibraryKey } from "@/content/types/module-library";
import type { PageModulesDocument } from "@/content/types/page-modules";
import {
  createModuleLibraryItem,
  resolveVariantFromPayload,
} from "@/lib/cms/module-library";
import { prisma } from "@/lib/db";

const LIBRARY_KEYS: {
  key: ModuleLibraryKey;
  label: string;
  pick: (modules: PageModulesDocument) => unknown;
}[] = [
  { key: "hero", label: "Hero", pick: (m) => m.hero },
  {
    key: "stickyNav",
    label: "Sticky navigation",
    pick: (m) => m.stickyNav,
  },
  { key: "overview", label: "Overview", pick: (m) => m.overview },
  { key: "inclusions", label: "Inclusions", pick: (m) => m.inclusions },
  { key: "eligibility", label: "Admission standards", pick: (m) => m.eligibility },
  { key: "syllabus", label: "Syllabus", pick: (m) => m.syllabus },
  { key: "schedule", label: "Daily schedule", pick: (m) => m.schedule },
  { key: "pricing", label: "Dates & pricing", pick: (m) => m.pricing },
  { key: "faqs", label: "FAQ", pick: (m) => m.faqs },
];

/**
 * Seed module library items from existing page_modules JSON.
 */
export async function seedModuleLibraryOnly() {
  console.log("Seeding module content library…");

  const pages = await prisma.page.findMany({
    select: { slug: true, title: true, pageModules: true },
  });

  const seen = new Set<string>();
  let created = 0;

  for (const page of pages) {
    const modules = page.pageModules as PageModulesDocument | null;
    if (!modules) continue;

    for (const entry of LIBRARY_KEYS) {
      const payload = entry.pick(modules);
      const dedupeKey = `${page.slug}:${entry.key}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const name = `${page.title} — ${entry.label}`;
      const variant = resolveVariantFromPayload(
        entry.key,
        payload as never,
      );

      try {
        await createModuleLibraryItem({
          moduleKey: entry.key,
          variant,
          name,
          payload: payload as never,
        });
        created += 1;
        console.log(`  library: ${name}`);
      } catch (error) {
        console.warn(
          `  skip ${dedupeKey}: ${error instanceof Error ? error.message : "invalid"}`,
        );
      }
    }
  }

  console.log(`Module library seed complete (${created} items).`);
}

seedModuleLibraryOnly()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
