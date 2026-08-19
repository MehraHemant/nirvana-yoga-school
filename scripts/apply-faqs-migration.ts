import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  normalizeFaqCategory,
  type FaqCategoryId,
} from "../src/content/types/faq-categories";
import type { FaqContextType } from "../src/content/types/faqs";
import type { FAQ } from "../src/content/types/shared";
import type { SharedFaq } from "../src/content/types/shared-sections";
import type { PageModulesDocument } from "../src/content/types/page-modules";
import { createId } from "../src/lib/db/ids";
import { getPool } from "../src/lib/db/node";

const migrationId = "0014_faqs";
const migrationPath = resolve(process.cwd(), "scripts/sql/0014_faqs.sql");

type LegacyFaqSource = {
  contextType: FaqContextType;
  contextKey: string;
  adminTag: string;
  items: Array<{
    question: string;
    answer: string;
    category?: FaqCategoryId | string;
    extras?: { image?: string; tag?: string };
  }>;
};

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
 * Maps module FAQ items into backfill rows.
 *
 * @param items - Legacy module FAQ items
 */
function moduleFaqs(items: FAQ[] | undefined): LegacyFaqSource["items"] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((faq) => faq.question?.trim() || faq.answer?.trim())
    .map((faq) => ({
      question: String(faq.question ?? ""),
      answer: String(faq.answer ?? ""),
      category: normalizeFaqCategory(faq.category),
    }));
}

/**
 * Maps shared FAQ items into backfill rows.
 *
 * @param items - Legacy shared FAQ items
 */
function sharedFaqs(items: SharedFaq[] | undefined): LegacyFaqSource["items"] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((faq) => faq.question?.trim() || faq.answer?.trim())
    .map((faq) => ({
      question: String(faq.question ?? ""),
      answer: String(faq.answer ?? ""),
      category: normalizeFaqCategory(faq.category),
      extras: {
        image: faq.image,
        tag: faq.tag,
      },
    }));
}

/**
 * Collects legacy FAQ rows from pages, modules, and global settings.
 *
 * @param client - Postgres client
 */
async function collectLegacyFaqSources(
  client: PgClient,
): Promise<LegacyFaqSource[]> {
  const sources: LegacyFaqSource[] = [];

  const pages = await client.query(
    `SELECT "slug", "type", "page_modules", "content_data"
     FROM "pages"
     WHERE "published" IS DISTINCT FROM FALSE`,
  );

  for (const row of pages.rows) {
    const slug = String(row.slug ?? "");
    const type = String(row.type ?? "");
    const modules = row.page_modules as PageModulesDocument | null;
    const moduleItems = moduleFaqs(modules?.faqs?.items);
    if (moduleItems.length > 0) {
      sources.push({
        contextType: "page",
        contextKey: slug,
        adminTag: type || "page",
        items: moduleItems,
      });
    }
  }

  const documents = await client.query(
    `SELECT p."slug", p."type", cd."document"
     FROM "course_documents" cd
     INNER JOIN "pages" p ON p."id" = cd."page_id"`,
  );

  for (const row of documents.rows) {
    const slug = String(row.slug ?? "");
    const type = String(row.type ?? "course");
    const document = row.document as { faqs?: FAQ[] } | null;
    const items = moduleFaqs(document?.faqs);
    if (items.length === 0) continue;

    const existing = sources.find(
      (source) =>
        source.contextType === "page" && source.contextKey === slug,
    );
    if (existing?.items.length) continue;

    sources.push({
      contextType: "page",
      contextKey: slug,
      adminTag: type,
      items,
    });
  }

  const globalKeys: Array<{
    key: string;
    adminTag: string;
    pick: (value: Record<string, unknown>) => LegacyFaqSource["items"];
  }> = [
    {
      key: "homeFaqs",
      adminTag: "home",
      pick: (value) => sharedFaqs(value.faqs as SharedFaq[] | undefined),
    },
    {
      key: "yttHub",
      adminTag: "ytt-hub",
      pick: (value) => sharedFaqs(value.faqs as SharedFaq[] | undefined),
    },
    {
      key: "venueFaqs",
      adminTag: "venue",
      pick: (value) => sharedFaqs(value.faqs as SharedFaq[] | undefined),
    },
  ];

  for (const entry of globalKeys) {
    const row = await client.query(
      `SELECT "value" FROM "global_settings" WHERE "key" = $1 LIMIT 1`,
      [entry.key],
    );
    const value = row.rows[0]?.value;
    if (!value || typeof value !== "object") continue;
    const items = entry.pick(value as Record<string, unknown>);
    if (items.length === 0) continue;
    sources.push({
      contextType: "global",
      contextKey: entry.key,
      adminTag: entry.adminTag,
      items,
    });
  }

  const homePage = await client.query(
    `SELECT "content_data" FROM "pages" WHERE "slug" = 'home' LIMIT 1`,
  );
  const homeContent = homePage.rows[0]?.content_data as
    | { faqs?: { faqs?: SharedFaq[] } }
    | undefined;
  const homeItems = sharedFaqs(homeContent?.faqs?.faqs);
  if (homeItems.length > 0) {
    const existing = sources.find(
      (source) =>
        source.contextType === "global" && source.contextKey === "homeFaqs",
    );
    if (!existing) {
      sources.push({
        contextType: "global",
        contextKey: "homeFaqs",
        adminTag: "home",
        items: homeItems,
      });
    }
  }

  return sources;
}

/**
 * Backfills legacy JSON FAQs into catalog + assignment tables (1:1 per item).
 *
 * @param client - Postgres client
 */
async function backfillLegacyFaqs(client: PgClient): Promise<{
  faqsCreated: number;
  assignmentsCreated: number;
  contexts: number;
}> {
  const existing = await client.query(
    `SELECT COUNT(*)::text AS count FROM "page_faq_assignments"`,
  );
  if (Number(existing.rows[0]?.count ?? 0) > 0) {
    console.log("FAQ assignments already exist — skipping backfill.");
    return { faqsCreated: 0, assignmentsCreated: 0, contexts: 0 };
  }

  const sources = await collectLegacyFaqSources(client);
  let faqsCreated = 0;
  let assignmentsCreated = 0;

  for (const source of sources) {
    for (const [index, item] of source.items.entries()) {
      const faqId = createId();
      const assignmentId = createId();
      await client.query(
        `INSERT INTO "faqs"
          ("id", "question", "answer", "category", "admin_tag")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          faqId,
          item.question,
          item.answer,
          normalizeFaqCategory(item.category),
          source.adminTag,
        ],
      );
      faqsCreated += 1;

      await client.query(
        `INSERT INTO "page_faq_assignments"
          ("id", "context_type", "context_key", "faq_id", "sort_order", "extras")
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [
          assignmentId,
          source.contextType,
          source.contextKey,
          faqId,
          index * 10,
          JSON.stringify(item.extras ?? {}),
        ],
      );
      assignmentsCreated += 1;
    }
  }

  return {
    faqsCreated,
    assignmentsCreated,
    contexts: sources.length,
  };
}

/**
 * Applies the FAQ schema migration and backfills legacy JSON FAQs.
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

    const backfill = await backfillLegacyFaqs(client);
    console.log(
      `FAQ backfill: contexts=${backfill.contexts}, faqs=${backfill.faqsCreated}, assignments=${backfill.assignmentsCreated}.`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown migration error";
    throw new Error(`Neon FAQ migration failed: ${message}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
