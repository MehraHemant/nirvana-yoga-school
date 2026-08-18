import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { COURSE_ROOM_CATALOG } from "../src/content/lodging/room-catalog";
import { getPool } from "../src/lib/db/node";

const migrationId = "0011_room_features";
const migrationPath = resolve(
  process.cwd(),
  "scripts/sql/0011_room_features.sql",
);

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

/**
 * Seeds course room package features (and without-accommodation description)
 * from the shared catalog definitions.
 *
 * @param client - Postgres client
 */
async function seedCourseRoomFeatures(client: {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{ rowCount: number | null }>;
}): Promise<number> {
  let updated = 0;
  for (const room of COURSE_ROOM_CATALOG) {
    if (!room.features?.length && room.slug !== "without-accommodation") {
      continue;
    }
    const features = JSON.stringify(room.features ?? []);
    if (room.slug === "without-accommodation") {
      const result = await client.query(
        `UPDATE "rooms"
         SET "features" = $3::jsonb, "description" = $4, "updated_at" = CURRENT_TIMESTAMP
         WHERE "catalog" = $1 AND "slug" = $2`,
        ["course", room.slug, features, room.description],
      );
      updated += result.rowCount ?? 0;
      continue;
    }
    const result = await client.query(
      `UPDATE "rooms"
       SET "features" = $3::jsonb, "updated_at" = CURRENT_TIMESTAMP
       WHERE "catalog" = $1 AND "slug" = $2`,
      ["course", room.slug, features],
    );
    updated += result.rowCount ?? 0;
  }
  return updated;
}

/**
 * Adds `features` JSONB to the shared `rooms` catalog table and seeds
 * course package feature bullets from the room catalog.
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

    const seeded = await seedCourseRoomFeatures(client);
    console.log(`Seeded course room features for ${seeded} row(s).`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
