/**
 * One-time migration: convert `pages` + their `content_data` blocks into the
 * headless `ContentItem` / `ContentReference` model.
 *
 * Each page block becomes a component ContentItem; each page becomes a `page`
 * ContentItem whose `sections` reference field links those components in order.
 *
 * Prerequisites: run `npx prisma migrate deploy` (creates content_items /
 * content_references) and `npm run db:seed-content-types` (creates the `page`
 * type + components) first.
 *
 * Usage:
 *   npm run db:migrate-content            # incremental (skips existing slugs)
 *   npm run db:migrate-content -- --reset # wipe items/refs, then rebuild
 */
import { LEGACY_TYPE_REMAP } from "@/content/data/default-content-types";
import { parsePageCmsDocument } from "@/content/types/page-cms";
import { syncItemReferences } from "@/lib/cms/content-items";
import {
  defaultsFromFields,
  normalizeItemData,
  parseContentFields,
} from "@/lib/cms/content-schema-utils";
import { syncDefaultContentTypes } from "@/lib/cms/content-types";
import { prisma } from "@/lib/db";

async function main() {
  const reset = process.argv.includes("--reset");

  await syncDefaultContentTypes();
  console.log("• Synced content types.");

  if (reset) {
    await prisma.contentReference.deleteMany({});
    await prisma.contentItem.deleteMany({});
    console.log("• Reset: cleared all content items + references.");
  }

  const pageType = await prisma.contentType.findUnique({
    where: { key: "page" },
  });
  if (!pageType) throw new Error("Missing `page` content type. Seed first.");
  const pageFields = parseContentFields(pageType.fields);

  const types = await prisma.contentType.findMany();
  const typeByKey = new Map(types.map((t) => [t.key, t]));

  const pages = await prisma.page.findMany({ orderBy: { createdAt: "asc" } });
  let created = 0;
  let skipped = 0;

  for (const page of pages) {
    const existing = await prisma.contentItem.findUnique({
      where: { slug: page.slug },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const doc = parsePageCmsDocument(page.contentData);
    const sectionIds: string[] = [];

    for (const block of doc.blocks) {
      const typeKey = LEGACY_TYPE_REMAP[block.typeKey] ?? block.typeKey;
      const type = typeByKey.get(typeKey);
      if (!type) {
        console.warn(`  ! unknown type "${block.typeKey}" on /${page.slug}`);
        continue;
      }
      const fields = parseContentFields(type.fields);
      const data = normalizeItemData(fields, {
        ...defaultsFromFields(fields),
        ...block.data,
      });
      const item = await prisma.contentItem.create({
        data: {
          contentTypeId: type.id,
          name: `${page.title} · ${type.name}`,
          published: page.published,
          publishedAt: page.published ? new Date() : null,
          data,
        },
      });
      sectionIds.push(item.id);
    }

    const pageData = normalizeItemData(pageFields, {
      title: page.title,
      description: page.description,
      eyebrow: page.eyebrow,
      image: page.image,
      cta_label: page.ctaLabel ?? "",
      cta_href: page.ctaHref ?? "",
      sections: sectionIds,
    });

    const pageItem = await prisma.contentItem.create({
      data: {
        contentTypeId: pageType.id,
        slug: page.slug,
        name: page.title,
        published: page.published,
        publishedAt: page.published ? new Date() : null,
        data: pageData,
      },
    });
    await syncItemReferences(pageItem.id, pageFields, pageData);

    created += 1;
    console.log(`• /${page.slug} → page item (${sectionIds.length} sections).`);
  }

  console.log(`\nDone. Created ${created} page(s), skipped ${skipped}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
