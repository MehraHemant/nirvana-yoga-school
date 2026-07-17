import { prisma } from "../src/lib/db";
import { buildSharedSectionSeeds } from "../prisma/seed-shared-sections";

async function main() {
  for (const row of buildSharedSectionSeeds()) {
    await prisma.globalSettings.upsert({
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
    await prisma.$disconnect();
  });
