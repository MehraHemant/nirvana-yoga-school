#!/usr/bin/env bash
# Fresh CMS on whatever DATABASE_URL is in .env (Hostinger or local).
# Wipes all tables, applies the baseline migration, then seeds.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Missing .env — copy from .env.example first"
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is empty in .env"
  exit 1
fi

# Mask password in log
masked=$(python3 - <<'PY'
import os, re
print(re.sub(r":([^:@/]+)@", ":***@", os.environ["DATABASE_URL"]))
PY
)
echo "==> Target: $masked"

echo "==> Dropping all tables"
npx tsx -e '
import { prisma } from "./src/lib/db";
async function main() {
  for (let i = 1; i <= 6; i++) {
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      break;
    } catch (e) {
      if (i === 6) throw e;
      console.warn("connect retry", i);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
  const rows = (await prisma.$queryRawUnsafe("SHOW TABLES")) as Record<string, string>[];
  for (const r of rows) {
    const name = Object.values(r)[0];
    console.log(" DROP", name);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${name}\``);
  }
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
  await prisma.$disconnect();
  console.log("Tables remaining: 0");
}
main().catch((e) => { console.error(e); process.exit(1); });
'

echo "==> migrate deploy"
npx prisma migrate deploy

echo "==> seed"
npm run db:seed

echo "==> Done. Admin: admin@nirvanayogaschoolindia.com / admin123"
