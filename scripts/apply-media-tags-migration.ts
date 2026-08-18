import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  canonicalizeMediaTag,
  canonicalizeMediaTags,
} from "../src/lib/cdn/media-tags";
import { getPool } from "../src/lib/db/node";

const migrationId = "0013_media_tags";
const migrationPath = resolve(process.cwd(), "scripts/sql/0013_media_tags.sql");

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
 * Rewrites media_images.tag to canonical short tags.
 *
 * @param client - Postgres client
 */
async function migrateMediaImageTags(client: PgClient): Promise<number> {
  const rows = await client.query(
    `SELECT "id", "tag" FROM "media_images" WHERE TRIM(COALESCE("tag", '')) <> ''`,
  );
  let updated = 0;
  for (const row of rows.rows) {
    const id = String(row.id ?? "");
    const raw = String(row.tag ?? "");
    const next = canonicalizeMediaTag(raw);
    if (next === raw.trim()) continue;
    await client.query(
      `UPDATE "media_images"
       SET "tag" = $2, "updated_at" = CURRENT_TIMESTAMP
       WHERE "id" = $1`,
      [id, next],
    );
    updated += 1;
  }
  return updated;
}

/**
 * Rewrites media_assets.tags jsonb arrays to canonical short tags.
 *
 * @param client - Postgres client
 */
async function migrateMediaAssetTags(client: PgClient): Promise<number> {
  const rows = await client.query(
    `SELECT "id", "tags" FROM "media_assets" WHERE COALESCE("tags", '[]'::jsonb) <> '[]'::jsonb`,
  );
  let updated = 0;
  for (const row of rows.rows) {
    const id = String(row.id ?? "");
    const rawTags = Array.isArray(row.tags)
      ? (row.tags as unknown[]).map(String)
      : [];
    if (rawTags.length === 0) continue;
    const nextTags = canonicalizeMediaTags(rawTags);
    const same =
      nextTags.length === rawTags.length &&
      nextTags.every((tag, index) => tag === rawTags[index]?.trim());
    if (same) continue;
    await client.query(
      `UPDATE "media_assets"
       SET "tags" = $2::jsonb
       WHERE "id" = $1`,
      [id, JSON.stringify(nextTags)],
    );
    updated += 1;
  }
  return updated;
}

/**
 * Applies media tag canonicalization migration.
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
    const applied = await client.query(
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

    const mediaImages = await migrateMediaImageTags(client);
    const mediaAssets = await migrateMediaAssetTags(client);
    console.log(
      `Retagged media: media_images=${mediaImages}, media_assets=${mediaAssets}.`,
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
