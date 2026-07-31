import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getPool } from "../src/lib/db/node";

type Migration = {
  id: string;
  path: string;
};

const migrations: Migration[] = [
  {
    id: "0003_ai_chat",
    path: resolve(process.cwd(), "scripts/sql/0003_ai_chat.sql"),
  },
  {
    id: "0008_restore_chat_history",
    path: resolve(process.cwd(), "scripts/sql/0008_restore_chat_history.sql"),
  },
];

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
 * Applies one SQL migration once via `_app_migrations`.
 *
 * @param client - Connected Postgres client
 * @param migration - Migration id + SQL path
 */
async function applyMigration(
  client: {
    query: (
      sql: string,
      params?: unknown[],
    ) => Promise<{ rowCount: number | null; rows: Array<{ id: string }> }>;
  },
  migration: Migration,
): Promise<void> {
  const applied = await client.query(
    'SELECT "id" FROM "_app_migrations" WHERE "id" = $1',
    [migration.id],
  );
  if (applied.rowCount) {
    console.log(`Neon migration ${migration.id} already applied.`);
    return;
  }

  const statements = splitStatements(await readFile(migration.path, "utf8"));
  await client.query("BEGIN");
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    await client.query('INSERT INTO "_app_migrations" ("id") VALUES ($1)', [
      migration.id,
    ]);
    await client.query("COMMIT");
    console.log(`Applied Neon migration ${migration.id}.`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  }
}

/**
 * Applies AI chat schema migrations (create + restore history tables).
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
    for (const migration of migrations) {
      await applyMigration(client, migration);
    }
  } catch (error) {
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
