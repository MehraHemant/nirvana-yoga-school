import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PageSeoMeta } from "../src/content/types/page-seo";
import {
  extractLegacyPageSeo,
  pageSeoRowFromMeta,
} from "../src/lib/cms/page-seo-utils";
import { getPool } from "../src/lib/db/node";

const migrationId = "0012_page_seo";
const migrationPath = resolve(process.cwd(), "scripts/sql/0012_page_seo.sql");
const YTT_HUB_SLUG = "yoga-teacher-training-in-rishikesh-india";

/**
 * Splits a migration file into executable PostgreSQL statements.
 *
 * @param sql - Migration SQL text
 */
function splitStatements(sql: string): string[] {
  const withoutLineComments = sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return withoutLineComments
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

type PgClient = {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{
    rowCount: number | null;
    rows: Array<Record<string, unknown>>;
  }>;
};

/**
 * Upserts one page_seo row via raw SQL (migration-safe, no Next.js cache).
 *
 * @param client - Postgres client
 * @param pageId - Parent page id
 * @param meta - SEO fields
 */
async function writePageSeoRow(
  client: PgClient,
  pageId: string,
  meta?: PageSeoMeta | null,
): Promise<void> {
  const row = pageSeoRowFromMeta(meta);
  await client.query(
    `INSERT INTO "page_seo"
      ("page_id", "title", "description", "og_image", "keywords", "no_index")
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT ("page_id") DO UPDATE SET
      "title" = EXCLUDED."title",
      "description" = EXCLUDED."description",
      "og_image" = EXCLUDED."og_image",
      "keywords" = EXCLUDED."keywords",
      "no_index" = EXCLUDED."no_index",
      "updated_at" = CURRENT_TIMESTAMP`,
    [
      pageId,
      row.title,
      row.description,
      row.ogImage,
      row.keywords,
      row.noIndex,
    ],
  );
}

/**
 * Backfills page_seo rows from page_modules / content_data JSON and yttHub settings.
 *
 * @param client - Postgres client
 */
async function backfillPageSeo(client: PgClient): Promise<number> {
  const pages = await client.query(
    `SELECT "id", "slug", "page_modules", "content_data" FROM "pages"`,
  );

  let synced = 0;
  for (const row of pages.rows) {
    const slug = String(row.slug ?? "");
    const pageId = String(row.id ?? "");
    if (!slug || !pageId) continue;

    const legacy = extractLegacyPageSeo({
      pageModules: row.page_modules,
      contentData: row.content_data,
    });
    if (!legacy) continue;

    await writePageSeoRow(client, pageId, legacy);
    synced += 1;
  }

  const yttHub = await client.query(
    `SELECT "value" FROM "global_settings" WHERE "key" = $1 LIMIT 1`,
    ["yttHub"],
  );
  const yttValue = yttHub.rows[0]?.value as { meta?: PageSeoMeta } | undefined;
  if (yttValue?.meta) {
    const hubPage = await client.query(
      `SELECT "id" FROM "pages" WHERE "slug" = $1 LIMIT 1`,
      [YTT_HUB_SLUG],
    );
    const pageId = hubPage.rows[0]?.id;
    if (pageId) {
      await writePageSeoRow(client, String(pageId), yttValue.meta);
      synced += 1;
    }
  }

  return synced;
}

/**
 * Applies the page_seo schema migration and backfills from existing JSON SEO.
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(
      'CREATE TABLE IF NOT EXISTS "_app_migrations" ("id" TEXT PRIMARY KEY, "applied_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    );
    const applied = await client.query<{ id: string }>(
      'SELECT "id" FROM "_app_migrations" WHERE "id" = $1',
      [migrationId],
    );
    if (!applied.rowCount) {
      const statements = splitStatements(await readFile(migrationPath, "utf8"));
      await client.query("BEGIN");
      try {
        for (const statement of statements) {
          await client.query(statement);
        }
        await client.query('INSERT INTO "_app_migrations" ("id") VALUES ($1)', [
          migrationId,
        ]);
        await client.query("COMMIT");
        console.log(`Applied Neon migration ${migrationId}.`);
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      }
    } else {
      console.log(`Neon migration ${migrationId} already applied.`);
    }

    const synced = await backfillPageSeo(client);
    console.log(`Backfilled page_seo for ${synced} page(s).`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
