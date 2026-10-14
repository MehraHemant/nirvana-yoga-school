import { normalizeFaqQuestion } from "../src/lib/cms/faq-utils";
import { getPool } from "../src/lib/db/node";

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  admin_tag: string;
  created_at: Date | string;
  assignment_count: number;
};

type AssignmentRow = {
  id: string;
  context_type: string;
  context_key: string;
  faq_id: string;
  sort_order: number;
  extras: Record<string, unknown> | null;
};

type DuplicateGroup = {
  normalizedQuestion: string;
  faqs: FaqRow[];
};

type MergeStats = {
  duplicateGroups: number;
  faqsRemoved: number;
  assignmentsRepointed: number;
  assignmentsMerged: number;
  assignmentsDeleted: number;
  canonicalEnriched: number;
};

type PgClient = {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{
    rowCount: number | null;
    rows: Array<Record<string, unknown>>;
  }>;
};

const dryRun = process.argv.includes("--dry-run");

/**
 * Picks the canonical FAQ to keep within a duplicate group.
 *
 * @param faqs - Duplicate FAQ rows
 */
function pickCanonicalFaq(faqs: FaqRow[]): FaqRow {
  return [...faqs].sort((a, b) => {
    if (b.assignment_count !== a.assignment_count) {
      return b.assignment_count - a.assignment_count;
    }
    if (b.answer.trim().length !== a.answer.trim().length) {
      return b.answer.trim().length - a.answer.trim().length;
    }
    const aCreated = new Date(a.created_at).getTime();
    const bCreated = new Date(b.created_at).getTime();
    return aCreated - bCreated;
  })[0];
}

/**
 * Merges assignment extras, preferring non-empty values.
 *
 * @param primary - Existing extras on the kept assignment
 * @param secondary - Extras from the duplicate assignment
 */
function mergeAssignmentExtras(
  primary: Record<string, unknown> | null,
  secondary: Record<string, unknown> | null,
): Record<string, unknown> {
  const merged = { ...(primary ?? {}) };
  for (const [key, value] of Object.entries(secondary ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    if (merged[key] === undefined || merged[key] === null || merged[key] === "") {
      merged[key] = value;
    }
  }
  return merged;
}

/**
 * Loads all FAQs with assignment counts.
 *
 * @param client - Postgres client
 */
async function loadFaqs(client: PgClient): Promise<FaqRow[]> {
  const result = await client.query(
    `SELECT f."id", f."question", f."answer", f."category", f."admin_tag", f."created_at",
            COUNT(a."id")::int AS assignment_count
     FROM "faqs" f
     LEFT JOIN "page_faq_assignments" a ON a."faq_id" = f."id"
     GROUP BY f."id"
     ORDER BY f."created_at" ASC`,
  );

  return result.rows.map((row) => ({
    id: String(row.id ?? ""),
    question: String(row.question ?? ""),
    answer: String(row.answer ?? ""),
    category: String(row.category ?? ""),
    admin_tag: String(row.admin_tag ?? ""),
    created_at: row.created_at as Date | string,
    assignment_count: Number(row.assignment_count ?? 0),
  }));
}

/**
 * Groups FAQs by normalized question text.
 *
 * @param faqs - All FAQ rows
 */
function findDuplicateGroups(faqs: FaqRow[]): DuplicateGroup[] {
  const groups = new Map<string, FaqRow[]>();

  for (const faq of faqs) {
    const normalized = normalizeFaqQuestion(faq.question);
    if (!normalized) continue;
    const existing = groups.get(normalized) ?? [];
    existing.push(faq);
    groups.set(normalized, existing);
  }

  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([normalizedQuestion, items]) => ({
      normalizedQuestion,
      faqs: items,
    }))
    .sort((a, b) => b.faqs.length - a.faqs.length);
}

/**
 * Loads assignments for one FAQ.
 *
 * @param client - Postgres client
 * @param faqId - FAQ id
 */
async function loadAssignments(
  client: PgClient,
  faqId: string,
): Promise<AssignmentRow[]> {
  const result = await client.query(
    `SELECT "id", "context_type", "context_key", "faq_id", "sort_order", "extras"
     FROM "page_faq_assignments"
     WHERE "faq_id" = $1
     ORDER BY "sort_order" ASC, "created_at" ASC`,
    [faqId],
  );

  return result.rows.map((row) => ({
    id: String(row.id ?? ""),
    context_type: String(row.context_type ?? ""),
    context_key: String(row.context_key ?? ""),
    faq_id: String(row.faq_id ?? ""),
    sort_order: Number(row.sort_order ?? 0),
    extras:
      row.extras && typeof row.extras === "object"
        ? (row.extras as Record<string, unknown>)
        : null,
  }));
}

/**
 * Loads one assignment for a context + FAQ pair.
 *
 * @param client - Postgres client
 * @param contextType - page | global
 * @param contextKey - Slug or global settings key
 * @param faqId - Canonical FAQ id
 */
async function loadContextAssignment(
  client: PgClient,
  contextType: string,
  contextKey: string,
  faqId: string,
): Promise<AssignmentRow | null> {
  const result = await client.query(
    `SELECT "id", "context_type", "context_key", "faq_id", "sort_order", "extras"
     FROM "page_faq_assignments"
     WHERE "context_type" = $1 AND "context_key" = $2 AND "faq_id" = $3
     LIMIT 1`,
    [contextType, contextKey, faqId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: String(row.id ?? ""),
    context_type: String(row.context_type ?? ""),
    context_key: String(row.context_key ?? ""),
    faq_id: String(row.faq_id ?? ""),
    sort_order: Number(row.sort_order ?? 0),
    extras:
      row.extras && typeof row.extras === "object"
        ? (row.extras as Record<string, unknown>)
        : null,
  };
}

/**
 * Enriches the canonical FAQ when duplicates have fuller content.
 *
 * @param client - Postgres client
 * @param canonical - FAQ row to keep
 * @param duplicates - FAQ rows to merge into canonical
 */
async function enrichCanonicalFaq(
  client: PgClient,
  canonical: FaqRow,
  duplicates: FaqRow[],
): Promise<number> {
  let enriched = 0;
  const canonicalAnswer = canonical.answer.trim();
  const canonicalAdminTag = canonical.admin_tag.trim();

  const bestAnswer = [...duplicates, canonical]
    .map((faq) => faq.answer.trim())
    .sort((a, b) => b.length - a.length)[0];

  const bestAdminTag =
    canonicalAdminTag ||
    duplicates.find((faq) => faq.admin_tag.trim())?.admin_tag.trim() ||
    "";

  const updates: string[] = [];
  const values: unknown[] = [];

  if (!canonicalAnswer && bestAnswer && bestAnswer !== canonicalAnswer) {
    updates.push(`"answer" = $${values.length + 1}`);
    values.push(bestAnswer);
    enriched += 1;
  }

  if (!canonicalAdminTag && bestAdminTag) {
    updates.push(`"admin_tag" = $${values.length + 1}`);
    values.push(bestAdminTag);
    enriched += 1;
  }

  if (updates.length === 0) return 0;

  values.push(canonical.id);
  if (!dryRun) {
    await client.query(
      `UPDATE "faqs"
       SET ${updates.join(", ")}, "updated_at" = CURRENT_TIMESTAMP
       WHERE "id" = $${values.length}`,
      values,
    );
  }

  return enriched;
}

/**
 * Merges duplicate FAQ rows and repoints assignments to one canonical row.
 *
 * @param client - Postgres client
 * @param groups - Duplicate FAQ groups
 */
async function dedupeGroups(
  client: PgClient,
  groups: DuplicateGroup[],
): Promise<MergeStats> {
  const stats: MergeStats = {
    duplicateGroups: groups.length,
    faqsRemoved: 0,
    assignmentsRepointed: 0,
    assignmentsMerged: 0,
    assignmentsDeleted: 0,
    canonicalEnriched: 0,
  };

  for (const group of groups) {
    const canonical = pickCanonicalFaq(group.faqs);
    const duplicates = group.faqs.filter((faq) => faq.id !== canonical.id);

    stats.canonicalEnriched += await enrichCanonicalFaq(
      client,
      canonical,
      duplicates,
    );

    for (const duplicate of duplicates) {
      const assignments = await loadAssignments(client, duplicate.id);

      for (const assignment of assignments) {
        const existing = await loadContextAssignment(
          client,
          assignment.context_type,
          assignment.context_key,
          canonical.id,
        );

        if (existing) {
          const sortOrder = Math.min(existing.sort_order, assignment.sort_order);
          const extras = mergeAssignmentExtras(existing.extras, assignment.extras);

          if (!dryRun) {
            await client.query(
              `UPDATE "page_faq_assignments"
               SET "sort_order" = $1, "extras" = $2::jsonb
               WHERE "id" = $3`,
              [sortOrder, JSON.stringify(extras), existing.id],
            );
            await client.query(
              `DELETE FROM "page_faq_assignments" WHERE "id" = $1`,
              [assignment.id],
            );
          }

          stats.assignmentsMerged += 1;
          stats.assignmentsDeleted += 1;
          continue;
        }

        if (!dryRun) {
          await client.query(
            `UPDATE "page_faq_assignments"
             SET "faq_id" = $1
             WHERE "id" = $2`,
            [canonical.id, assignment.id],
          );
        }

        stats.assignmentsRepointed += 1;
      }

      if (!dryRun) {
        await client.query(`DELETE FROM "faqs" WHERE "id" = $1`, [duplicate.id]);
      }

      stats.faqsRemoved += 1;
    }
  }

  return stats;
}

/**
 * Prints duplicate group summary for inspection.
 *
 * @param groups - Duplicate FAQ groups
 */
function printDuplicatePreview(groups: DuplicateGroup[]): void {
  if (groups.length === 0) {
    console.log("No duplicate FAQ questions found.");
    return;
  }

  console.log(`Found ${groups.length} duplicate question group(s):`);
  for (const group of groups.slice(0, 20)) {
    const preview = group.faqs[0]?.question.replace(/\s+/g, " ").trim();
    console.log(
      `  - "${preview}" (${group.faqs.length} rows, ${group.faqs.reduce((sum, faq) => sum + faq.assignment_count, 0)} assignments)`,
    );
  }
  if (groups.length > 20) {
    console.log(`  ... and ${groups.length - 20} more group(s).`);
  }
}

/**
 * Deduplicates FAQ catalog rows by normalized question text.
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    const beforeFaqs = await loadFaqs(client);
    const beforeAssignments = await client.query(
      `SELECT COUNT(*)::int AS count FROM "page_faq_assignments"`,
    );
    const beforeAssignmentCount = Number(beforeAssignments.rows[0]?.count ?? 0);

    const groups = findDuplicateGroups(beforeFaqs);
    printDuplicatePreview(groups);

    if (groups.length === 0) {
      console.log(
        `Counts unchanged: faqs=${beforeFaqs.length}, assignments=${beforeAssignmentCount}.`,
      );
      return;
    }

    if (dryRun) {
      const wouldRemove = groups.reduce(
        (sum, group) => sum + (group.faqs.length - 1),
        0,
      );
      console.log(
        `Dry run only — would remove ${wouldRemove} duplicate FAQ row(s) across ${groups.length} group(s).`,
      );
      console.log(
        `Current counts: faqs=${beforeFaqs.length}, assignments=${beforeAssignmentCount}.`,
      );
      return;
    }

    await client.query("BEGIN");
    try {
      const stats = await dedupeGroups(client, groups);
      await client.query("COMMIT");

      const afterFaqs = await loadFaqs(client);
      const afterAssignments = await client.query(
        `SELECT COUNT(*)::int AS count FROM "page_faq_assignments"`,
      );
      const afterAssignmentCount = Number(afterAssignments.rows[0]?.count ?? 0);

      console.log("FAQ dedupe complete.");
      console.log(
        `Before: faqs=${beforeFaqs.length}, assignments=${beforeAssignmentCount}.`,
      );
      console.log(
        `After:  faqs=${afterFaqs.length}, assignments=${afterAssignmentCount}.`,
      );
      console.log(
        `Merged groups=${stats.duplicateGroups}, removed=${stats.faqsRemoved}, repointed=${stats.assignmentsRepointed}, merged=${stats.assignmentsMerged}, deleted=${stats.assignmentsDeleted}, enriched=${stats.canonicalEnriched}.`,
      );
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
