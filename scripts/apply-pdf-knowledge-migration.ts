import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getPool } from "../src/lib/db/node";

const migrationId = "0004_chat_knowledge_pdfs";
const migrationPath = resolve(
  process.cwd(),
  "scripts/sql/0004_chat_knowledge_pdfs.sql",
);

/**
 * Splits a migration file into executable PostgreSQL statements.
 *
 * @param sql - Migration SQL text
 * @returns Non-empty statements
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
 * Applies the chat knowledge PDFs schema migration once via `_app_migrations`.
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
    if (applied.rowCount) {
      console.log(`Neon migration ${migrationId} already applied.`);
      return;
    }

    const statements = splitStatements(await readFile(migrationPath, "utf8"));
    await client.query("BEGIN");
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
    const message =
      error instanceof Error ? error.message : "Unknown migration error";
    throw new Error(`Neon migration failed: ${message}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
