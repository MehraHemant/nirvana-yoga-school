/**
 * Seeds / syncs system content types for the CMS.
 *
 * Usage: npm run db:seed-content-types
 */
import { syncDefaultContentTypes } from "@/lib/cms/content-types";
import { db } from "@/lib/db";

async function main() {
  await syncDefaultContentTypes();
  console.log("Synced system content types.");

  // Remove obsolete keys from the first CMS iteration
  for (const key of ["cta", "switch_block"]) {
    const row = await db.contentType.findUnique({ where: { key } });
    if (row && !row.isSystem) {
      await db.contentType.delete({ where: { key } });
      console.log(`removed legacy ${key}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
