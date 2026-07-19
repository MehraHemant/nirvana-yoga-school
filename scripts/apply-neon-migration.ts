import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getPool } from "../src/lib/db/node";

const migrationId = "0001_init";
const migrationPath = resolve(
  process.cwd(),
  "scripts/sql/0001_init.sql",
);

/**
 * Splits the generated baseline into individual PostgreSQL statements.
 *
 * The generated baseline contains no procedural blocks, so semicolons
 * safely delimit statements here.
 *
 * @param sql - Generated baseline SQL
 * @returns Executable SQL statements
 */
function splitStatements(sql: string): string[] {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

/**
 * Applies the versioned Neon baseline exactly once.
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
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    throw new Error(
      "Neon migration failed. Check database connectivity and schema state.",
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(() => {
  console.error("Neon migration failed.");
  process.exit(1);
});
