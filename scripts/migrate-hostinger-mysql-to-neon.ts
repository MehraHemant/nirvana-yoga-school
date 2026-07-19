import mysql, { type RowDataPacket } from "mysql2/promise";
import { getPool } from "../src/lib/db/node";

type TableSpec = { name: string; naturalKey?: string };

const TABLES: readonly TableSpec[] = [
  { name: "content_types", naturalKey: "key" },
  { name: "media_assets" },
  { name: "admin_users", naturalKey: "email" },
  { name: "pages", naturalKey: "slug" },
  { name: "content_items", naturalKey: "slug" },
  { name: "navigation_groups", naturalKey: "key" },
  { name: "global_settings", naturalKey: "key" },
  { name: "blog_posts", naturalKey: "slug" },
  { name: "module_library_items" },
  { name: "lead_submissions" },
  { name: "bookings" },
  { name: "content_revisions" },
  { name: "content_references" },
  { name: "page_sections" },
  { name: "page_packages" },
  { name: "page_gallery_images" },
  { name: "page_cards" },
  { name: "page_people" },
  { name: "page_highlights" },
  { name: "course_documents", naturalKey: "page_id" },
  { name: "navigation_items" },
  { name: "section_subsections" },
  { name: "section_items" },
  { name: "subsection_items" },
];

const FOREIGN_KEYS: Record<string, Record<string, string>> = {
  content_items: { content_type_id: "content_types" },
  content_references: {
    from_id: "content_items",
    to_id: "content_items",
  },
  pages: { content_type_id: "content_types" },
  page_sections: { page_id: "pages" },
  page_packages: { page_id: "pages" },
  page_gallery_images: {
    page_id: "pages",
    media_asset_id: "media_assets",
  },
  page_cards: { page_id: "pages" },
  page_people: { page_id: "pages" },
  page_highlights: { page_id: "pages" },
  course_documents: { page_id: "pages" },
  navigation_items: { group_id: "navigation_groups" },
  section_subsections: { section_id: "page_sections" },
  section_items: { section_id: "page_sections" },
  subsection_items: { subsection_id: "section_subsections" },
  content_revisions: { admin_user_id: "admin_users" },
};

type SourceColumn = RowDataPacket & { COLUMN_NAME: string };
type TargetColumn = {
  column_name: string;
  data_type: string;
  udt_name: string;
};
type Summary = { created: number; updated: number; skipped: number };

/**
 * Quotes a PostgreSQL or MySQL identifier from trusted metadata.
 *
 * @param identifier - Database identifier
 * @returns Safely quoted identifier
 */
function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

/**
 * Resolves the explicitly legacy MySQL connection without logging it.
 *
 * @returns MySQL connection URL
 */
function getLegacyUrl(): string {
  const url =
    process.env.HOSTINGER_DATABASE_URL ??
    process.env.LEGACY_MYSQL_URL ??
    process.env.MYSQL_DATABASE_URL ??
    process.env.DATABASE_URL;

  if (!url?.startsWith("mysql")) {
    throw new Error(
      "Set HOSTINGER_DATABASE_URL (or LEGACY_MYSQL_URL) to a MySQL URL.",
    );
  }
  const parsed = new URL(url);
  parsed.searchParams.delete("connection_limit");
  return parsed.toString();
}

/**
 * Converts MySQL driver values to the corresponding Neon value.
 *
 * @param value - Source column value
 * @param target - Target column metadata
 * @returns Value safe for the Neon query parameter
 */
function normalizeValue(value: unknown, target: TargetColumn): unknown {
  if (value === null || value === undefined) return null;
  if (target.data_type === "boolean") return Boolean(value);
  if (
    typeof value === "string" &&
    (target.data_type === "date" || target.data_type.includes("timestamp")) &&
    value.startsWith("0000-00-00")
  ) {
    return null;
  }
  if (target.udt_name === "jsonb") {
    if (typeof value === "string") {
      JSON.parse(value);
      return value;
    }
    return JSON.stringify(value);
  }
  return value;
}

/**
 * Removes duplicate faculty rows before importing legacy page_people records.
 * Teacher selection uses a normalized name slug, so those duplicates cannot
 * be represented independently by the CMS.
 *
 * @param rows - Legacy page_people rows
 * @returns One deterministic row for each page/name identity
 */
function uniquePagePeopleRows(rows: RowDataPacket[]): RowDataPacket[] {
  const seen = new Set<string>();
  return [...rows]
    .sort((left, right) => {
      const leftOrder = Number(left.sort_order ?? 0);
      const rightOrder = Number(right.sort_order ?? 0);
      return (
        leftOrder - rightOrder ||
        String(left.id).localeCompare(String(right.id))
      );
    })
    .filter((row) => {
      const name = String(row.name ?? "")
        .trim()
        .toLocaleLowerCase();
      const identity = `${String(row.page_id ?? "")}:${name}`;
      if (!name || seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
}

/**
 * Imports matching Hostinger MySQL CMS tables into Neon without deletions.
 */
async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const source = await mysql.createConnection({
    uri: getLegacyUrl(),
    dateStrings: true,
    timezone: "Z",
  });
  const target = getPool();
  const importedAt = new Date().toISOString();
  const idMaps = new Map<string, Map<string, string>>();
  const summary = new Map<string, Summary>();

  try {
    const [sourceTables] = await source.query<RowDataPacket[]>(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'",
    );
    const available = new Set(
      sourceTables.map((table) => String(table.TABLE_NAME)),
    );
    const unsupported = [...available]
      .filter((table) => !TABLES.some(({ name }) => name === table))
      .sort();

    if (unsupported.length > 0) {
      console.warn(`Unmapped source tables: ${unsupported.join(", ")}`);
    }

    if (!dryRun) await target.query("BEGIN");
    for (const { name, naturalKey } of TABLES) {
      if (!available.has(name)) {
        console.warn(`Skipped missing source table: ${name}`);
        continue;
      }

      const [sourceColumns] = await source.query<SourceColumn[]>(
        "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? ORDER BY ORDINAL_POSITION",
        [name],
      );
      const targetColumnsResult = await target.query<TargetColumn>(
        "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
        [name],
      );
      const targetColumns = new Map(
        targetColumnsResult.rows.map((column) => [column.column_name, column]),
      );
      const columns = sourceColumns
        .map(({ COLUMN_NAME }) => COLUMN_NAME)
        .filter((column) => targetColumns.has(column));

      if (!columns.includes("id")) {
        throw new Error(
          `${name} cannot be imported: missing stable id column.`,
        );
      }

      const [sourceRows] = await source.query<RowDataPacket[]>(
        `SELECT ${columns.map((column) => `\`${column}\``).join(", ")} FROM \`${name}\``,
      );
      const rows =
        name === "page_people" ? uniquePagePeopleRows(sourceRows) : sourceRows;
      const existingRows = await target.query<{
        id: string;
        natural_key: string;
      }>(
        naturalKey
          ? `SELECT "id", ${quoteIdentifier(naturalKey)} AS "natural_key" FROM ${quoteIdentifier(name)}`
          : `SELECT "id", NULL::text AS "natural_key" FROM ${quoteIdentifier(name)}`,
      );
      const existingById = new Set(existingRows.rows.map((row) => row.id));
      const existingByKey = new Map(
        existingRows.rows
          .filter((row) => row.natural_key)
          .map((row) => [row.natural_key, row.id]),
      );
      const tableSummary: Summary = { created: 0, updated: 0, skipped: 0 };
      const idMap = new Map<string, string>();
      const writeRows: unknown[][] = [];

      for (const sourceRow of rows) {
        const sourceId = String(sourceRow.id ?? "");
        if (!sourceId) {
          tableSummary.skipped += 1;
          continue;
        }

        let canonicalId = sourceId;
        if (existingById.has(sourceId)) {
          tableSummary.updated += 1;
        } else if (naturalKey && sourceRow[naturalKey] != null) {
          const referencedTable = FOREIGN_KEYS[name]?.[naturalKey];
          const naturalKeyValue = referencedTable
            ? (idMaps
                .get(referencedTable)
                ?.get(String(sourceRow[naturalKey])) ?? sourceRow[naturalKey])
            : sourceRow[naturalKey];
          const existingCanonicalId = existingByKey.get(
            String(naturalKeyValue),
          );
          if (existingCanonicalId) {
            canonicalId = existingCanonicalId;
            tableSummary.updated += 1;
          } else {
            tableSummary.created += 1;
          }
        } else {
          tableSummary.created += 1;
        }

        const values = columns.map((column) => {
          const targetColumn = targetColumns.get(column);
          if (!targetColumn) {
            throw new Error(`${name}.${column} is not available on Neon.`);
          }
          const referencedTable = FOREIGN_KEYS[name]?.[column];
          const sourceValue = sourceRow[column];
          const referencedId =
            referencedTable && sourceValue != null
              ? idMaps.get(referencedTable)?.get(String(sourceValue))
              : undefined;
          const rawValue =
            column === "id"
              ? canonicalId
              : (referencedId ??
                (column === "updated_at"
                  ? (sourceValue ?? sourceRow.created_at)
                  : sourceValue));
          const value = normalizeValue(rawValue, targetColumn);
          if (value !== null) return value;
          if (column === "updated_at") {
            return (
              normalizeValue(sourceRow.created_at, targetColumn) ?? importedAt
            );
          }
          return column === "created_at" ? importedAt : value;
        });
        const idIndex = columns.indexOf("id");
        values[idIndex] = canonicalId;
        idMap.set(sourceId, canonicalId);
        writeRows.push(values);
      }

      if (!dryRun && writeRows.length > 0) {
        const updateColumns = columns.filter((column) => column !== "id");
        const updateSql = updateColumns
          .map(
            (column) =>
              `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`,
          )
          .join(", ");
        for (let offset = 0; offset < writeRows.length; offset += 100) {
          const batch = writeRows.slice(offset, offset + 100);
          const values = batch.flat();
          const placeholders = batch
            .map(
              (row, rowIndex) =>
                `(${row
                  .map(
                    (_, columnIndex) =>
                      `$${rowIndex * columns.length + columnIndex + 1}`,
                  )
                  .join(", ")})`,
            )
            .join(", ");
          await target.query(
            `INSERT INTO ${quoteIdentifier(name)} (${columns
              .map(quoteIdentifier)
              .join(
                ", ",
              )}) VALUES ${placeholders} ON CONFLICT ("id") DO UPDATE SET ${updateSql}`,
            values,
          );
        }
      }

      idMaps.set(name, idMap);
      summary.set(name, tableSummary);
    }
    if (!dryRun) await target.query("COMMIT");
  } catch (error) {
    if (!dryRun) await target.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await source.end();
    await target.end();
  }

  console.log(dryRun ? "Dry-run source counts:" : "Migration complete:");
  for (const { name } of TABLES) {
    const counts = summary.get(name);
    if (counts) console.log(`${name}: ${JSON.stringify(counts)}`);
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? `Migration failed: ${error.message}`
      : "Migration failed.",
  );
  process.exit(1);
});
