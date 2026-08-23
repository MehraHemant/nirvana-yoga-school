import { RESIDENTIAL_COURSE_SLUGS } from "../src/content/pages/slugs";
import { createId } from "../src/lib/db/ids";
import { getPool } from "../src/lib/db/node";

type BatchSeed = {
  dates: string;
  spaces: string;
  status: string;
  tone: "open" | "fast" | "last";
};

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  duration: string | null;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Seat counts mirrored from the public-site fallback in upcomingDatesShared. */
const SEAT_PATTERN = [2, 4, 3, 4, 7, 6, 7, 9, 10, 12, 12];

/**
 * Formats a day with an English ordinal suffix.
 *
 * @param day - Day of month (1–31)
 */
function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/**
 * Builds a human-readable date range label.
 *
 * @param startDay - Start day of month
 * @param startMonth - Start month index (0–11)
 * @param startYear - Start year
 * @param endDay - End day of month
 * @param endMonth - End month index (0–11)
 * @param endYear - End year
 */
function formatRange(
  startDay: number,
  startMonth: number,
  startYear: number,
  endDay: number,
  endMonth: number,
  endYear: number,
): string {
  const startLabel = `${ordinal(startDay)} ${MONTHS[startMonth]}`;
  const endLabel = `${ordinal(endDay)} ${MONTHS[endMonth]}`;
  if (startMonth === endMonth && startYear === endYear) {
    return `${startLabel} to ${endLabel} ${endYear}`;
  }
  if (startYear === endYear) {
    return `${startLabel} to ${endLabel} ${endYear}`;
  }
  return `${startLabel} ${startYear} to ${endLabel} ${endYear}`;
}

/**
 * Maps remaining seats to batch status metadata.
 *
 * @param seats - Seats left in the batch
 * @param dates - Batch date label
 */
function seatsToBatch(seats: number, dates: string): BatchSeed {
  const spaces = `${seats} seat${seats === 1 ? "" : "s"} left`;
  if (seats <= 1) {
    return { dates, spaces, status: "Last seats", tone: "last" };
  }
  if (seats <= 3) {
    return { dates, spaces, status: "Filling Fast", tone: "fast" };
  }
  return { dates, spaces, status: "Open", tone: "open" };
}

/**
 * Adds days to a calendar date and returns parts.
 *
 * @param year - Start year
 * @param month - Start month (0–11)
 * @param day - Start day
 * @param addDays - Days to add (inclusive span uses addDays - 1 for end)
 */
function addDays(
  year: number,
  month: number,
  day: number,
  addDaysCount: number,
): { year: number; month: number; day: number } {
  const date = new Date(Date.UTC(year, month, day));
  date.setUTCDate(date.getUTCDate() + addDaysCount - 1);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

/**
 * Returns the number of days in a month.
 *
 * @param year - Calendar year
 * @param month - Month index (0–11)
 */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Builds monthly 25-day batches (200-hour YTT pattern from the live fallback).
 */
function batchesFor25DayCourse(): BatchSeed[] {
  const raw = [
    { month: 6, year: 2026, start: 2, end: 26 },
    { month: 7, year: 2026, start: 2, end: 26 },
    { month: 8, year: 2026, start: 2, end: 26 },
    { month: 9, year: 2026, start: 2, end: 26 },
    { month: 10, year: 2026, start: 2, end: 26 },
    { month: 11, year: 2026, start: 2, end: 26 },
    { month: 0, year: 2027, start: 4, end: 28 },
    { month: 1, year: 2027, start: 2, end: 26 },
    { month: 2, year: 2027, start: 2, end: 26 },
    { month: 3, year: 2027, start: 2, end: 26 },
    { month: 4, year: 2027, start: 2, end: 26 },
  ];
  return raw.map((entry, index) => {
    const dates = formatRange(
      entry.start,
      entry.month,
      entry.year,
      entry.end,
      entry.month,
      entry.year,
    );
    return seatsToBatch(SEAT_PATTERN[index % SEAT_PATTERN.length], dates);
  });
}

/**
 * Builds monthly 29-day batches for the 300-hour advanced training.
 */
function batchesFor29DayCourse(): BatchSeed[] {
  const starts: Array<{ month: number; year: number; startDay: number }> = [];
  for (let month = 8, year = 2026; starts.length < 9; month += 1) {
    if (month > 11) {
      month = 0;
      year += 1;
    }
    const startDay = month === 0 && year === 2027 ? 4 : 2;
    starts.push({ month, year, startDay });
  }

  return starts.map((entry, index) => {
    const end = addDays(entry.year, entry.month, entry.startDay, 29);
    const dates = formatRange(
      entry.startDay,
      entry.month,
      entry.year,
      end.day,
      end.month,
      end.year,
    );
    return seatsToBatch(SEAT_PATTERN[index % SEAT_PATTERN.length], dates);
  });
}

/**
 * Builds ~59-day batches (500-hour immersive) spanning two calendar months.
 */
function batchesFor59DayCourse(): BatchSeed[] {
  const starts = [
    { month: 8, year: 2026, startDay: 2 },
    { month: 10, year: 2026, startDay: 2 },
    { month: 0, year: 2027, startDay: 4 },
    { month: 2, year: 2027, startDay: 2 },
    { month: 4, year: 2027, startDay: 2 },
  ];

  return starts.map((entry, index) => {
    const end = addDays(entry.year, entry.month, entry.startDay, 59);
    const dates = formatRange(
      entry.startDay,
      entry.month,
      entry.year,
      end.day,
      end.month,
      end.year,
    );
    return seatsToBatch(SEAT_PATTERN[index % SEAT_PATTERN.length], dates);
  });
}

/**
 * Builds monthly 7-day intensive batches (yin yoga, sound healing).
 */
function batchesFor7DayCourse(): BatchSeed[] {
  const starts: Array<{ month: number; year: number }> = [];
  for (let month = 8, year = 2026; starts.length < 10; month += 1) {
    if (month > 11) {
      month = 0;
      year += 1;
    }
    starts.push({ month, year });
  }

  return starts.map((entry, index) => {
    const endDay = Math.min(7, daysInMonth(entry.year, entry.month));
    const dates = formatRange(
      1,
      entry.month,
      entry.year,
      endDay,
      entry.month,
      entry.year,
    );
    return seatsToBatch(SEAT_PATTERN[index % SEAT_PATTERN.length], dates);
  });
}

/**
 * Picks upcoming batch rows based on a course duration label.
 *
 * @param duration - Course duration from the CMS document
 */
function batchesForDuration(duration: string | null): BatchSeed[] {
  const normalized = (duration ?? "").trim().toLowerCase();
  if (normalized.startsWith("59")) return batchesFor59DayCourse();
  if (normalized.startsWith("29")) return batchesFor29DayCourse();
  if (normalized.startsWith("7")) return batchesFor7DayCourse();
  return batchesFor25DayCourse();
}

/**
 * Maps a batch seed into pricing-module JSON (admin / page_modules shape).
 *
 * @param batch - Batch seed row
 */
function batchToPricingJson(batch: BatchSeed) {
  const statusColor =
    batch.tone === "last"
      ? "text-rose-700 bg-rose-50 border-rose-200"
      : batch.tone === "fast"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-emerald-700 bg-emerald-50 border-emerald-200";
  return {
    dates: batch.dates,
    spaces: batch.spaces,
    status: batch.status,
    statusColor,
    tone: batch.tone,
  };
}

/**
 * Seeds `page_date_batches` (and mirrors into `page_modules.pricing.batches`).
 */
async function main(): Promise<void> {
  if (!process.env.NEON_DB_POSTGRES_URL?.trim()) {
    throw new Error("NEON_DB_POSTGRES_URL is required.");
  }

  const force = process.argv.includes("--force");
  const pool = getPool();
  const client = await pool.connect();

  let updated = 0;
  let skipped = 0;
  const report: Array<{ slug: string; batchCount: number; sample: string }> =
    [];

  try {
    const pages = await client.query<CourseRow>(
      `SELECT p."id", p."slug", p."title", cd."document"->>'duration' AS "duration"
       FROM "pages" p
       LEFT JOIN "course_documents" cd ON cd."page_id" = p."id"
       WHERE p."slug" = ANY($1::text[])
       ORDER BY p."slug"`,
      [RESIDENTIAL_COURSE_SLUGS],
    );

    if (pages.rowCount === 0) {
      throw new Error("No residential course pages found in the database.");
    }

    const missingSlugs = RESIDENTIAL_COURSE_SLUGS.filter(
      (slug) => !pages.rows.some((row) => row.slug === slug),
    );
    if (missingSlugs.length > 0) {
      console.warn(`Warning: missing pages for slugs: ${missingSlugs.join(", ")}`);
    }

    for (const page of pages.rows) {
      const existing = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS "count"
         FROM "page_date_batches"
         WHERE "page_id" = $1 AND TRIM("dates") <> ''`,
        [page.id],
      );
      const existingCount = Number(existing.rows[0]?.count ?? "0");
      if (existingCount > 0 && !force) {
        skipped += 1;
        console.log(`Skipped ${page.slug} (${existingCount} batches already present)`);
        continue;
      }

      const batches = batchesForDuration(page.duration);
      await client.query(`DELETE FROM "page_date_batches" WHERE "page_id" = $1`, [
        page.id,
      ]);

      for (let sort = 0; sort < batches.length; sort += 1) {
        const batch = batches[sort];
        await client.query(
          `INSERT INTO "page_date_batches"
            ("id", "page_id", "dates", "spaces", "status", "tone", "sort")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            createId(),
            page.id,
            batch.dates,
            batch.spaces,
            batch.status,
            batch.tone,
            sort,
          ],
        );
      }

      const pricingBatches = batches.map(batchToPricingJson);
      await client.query(
        `UPDATE "pages"
         SET "page_modules" = jsonb_set(
           jsonb_set(
             COALESCE("page_modules", '{}'::jsonb),
             '{pricing}',
             COALESCE("page_modules"->'pricing', '{}'::jsonb),
             true
           ),
           '{pricing,batches}',
           $2::jsonb,
           true
         ),
         "updated_at" = CURRENT_TIMESTAMP
         WHERE "id" = $1`,
        [page.id, JSON.stringify(pricingBatches)],
      );

      updated += 1;
      report.push({
        slug: page.slug,
        batchCount: batches.length,
        sample: batches[0]?.dates ?? "",
      });
      console.log(
        `Seeded ${page.slug}: ${batches.length} batches (duration=${page.duration ?? "unknown"})`,
      );
    }

    console.log(
      `\nResidential batch seed complete: updated=${updated}, skipped=${skipped}, totalCourses=${RESIDENTIAL_COURSE_SLUGS.length}.`,
    );
    if (report.length > 0) {
      console.log("\nSample first batch per course:");
      for (const row of report) {
        console.log(`  ${row.slug}: ${row.sample} (+${row.batchCount - 1} more)`);
      }
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
