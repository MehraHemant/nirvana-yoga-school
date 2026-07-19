import { buildSharedSectionSeeds } from "./seed-shared-sections";
import { db } from "../src/lib/db";

async function main() {
  for (const row of buildSharedSectionSeeds()) {
    await db.globalSettings.upsert({
      where: { key: row.key },
      create: row,
      update: { value: row.value },
    });
    console.log("seeded", row.key);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
