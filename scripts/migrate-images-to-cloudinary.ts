/**
 * Moves images still hosted on the old site (www.nirvanayogaschoolindia.com)
 * to Cloudinary and repoints the database at the new URLs.
 *
 * For each old image URL used by the selected pages:
 *   1. download it from the old site,
 *   2. upload it to Cloudinary (same folder as admin uploads),
 *   3. record it in the media library (`media_assets` + `media_images`),
 *   4. replace the old URL everywhere in the database (every text/JSON column).
 *
 * Idempotent: an image already migrated (matched by `media_assets.description`
 * = "Migrated from <old url>") is reused, never uploaded twice.
 *
 *   npm run db:migrate:images -- --type online            # online course pages
 *   npm run db:migrate:images -- --type online --dry-run  # plan only
 *   npm run db:migrate:images -- --slug about-us          # one page
 *   npm run db:migrate:images -- --all                    # everything left
 */
import { v2 as cloudinary } from "cloudinary";
import { createId, getPool } from "../src/lib/db/node";

type Pg = {
  query: <T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: T[]; rowCount?: number }>;
};

// Filenames may contain spaces ("Ole Netek.webp"), so a space is allowed as
// long as another URL does not start right after it. A bad match only fails
// to download and is left untouched.
const OLD_HOST_RE =
  /https?:\/\/(?:www\.)?nirvanayogaschoolindia\.com\/(?:[^"'\s)\\<>]|\s(?!https?:))+?\.(?:webp|jpe?g|png|gif|avif|svg)(?![a-z0-9])/gi;
const MIGRATED_PREFIX = "Migrated from ";
const FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "nirvana-cms";

/** Reads `--flag value` from argv. */
function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

/**
 * All old-site image URLs used by pages matching the filter.
 *
 * @param pool - DB pool
 * @param filter - Page type or slug
 */
async function collectUrls(
  pool: Pg,
  filter: { type?: string; slug?: string },
): Promise<Map<string, string[]>> {
  const { rows } = await pool.query<{ slug: string; blob: string }>(
    `SELECT p.slug, concat_ws(' ', p.image, p.page_modules::text, p.content_data::text, s.og_image,
       (SELECT string_agg(concat_ws(' ', ps.image, ps.images::text, ps.blocks::text,
          (SELECT string_agg(ss.image, ' ') FROM section_subsections ss WHERE ss.section_id = ps.id)), ' ')
          FROM page_sections ps WHERE ps.page_id = p.id),
       (SELECT string_agg(image, ' ') FROM page_packages x WHERE x.page_id = p.id),
       (SELECT string_agg(url, ' ') FROM page_gallery_images x WHERE x.page_id = p.id),
       (SELECT string_agg(image, ' ') FROM page_people x WHERE x.page_id = p.id),
       (SELECT string_agg(image, ' ') FROM page_highlights x WHERE x.page_id = p.id),
       (SELECT string_agg(document::text, ' ') FROM course_documents x WHERE x.page_id = p.id)
     ) AS blob
     FROM pages p LEFT JOIN page_seo s ON s.page_id = p.id
     WHERE ($1::text IS NULL OR p.type::text = $1) AND ($2::text IS NULL OR p.slug = $2)`,
    [filter.type ?? null, filter.slug ?? null],
  );
  const urls = new Map<string, string[]>();
  for (const row of rows) {
    for (const url of new Set(row.blob?.match(OLD_HOST_RE) ?? [])) {
      urls.set(url, [...(urls.get(url) ?? []), row.slug]);
    }
  }
  return urls;
}

/**
 * Every old-site image URL anywhere in the database (pages, settings, blog…).
 *
 * @param pool - DB pool
 * @param columns - Columns known to contain old-site URLs
 */
async function collectAllUrls(
  pool: Pg,
  columns: { table_name: string; column_name: string }[],
): Promise<Map<string, string[]>> {
  const urls = new Map<string, string[]>();
  for (const c of columns) {
    const { rows } = await pool.query<{ v: string }>(
      `SELECT "${c.column_name}"::text AS v FROM "${c.table_name}"
        WHERE strpos("${c.column_name}"::text, 'nirvanayogaschoolindia.com/') > 0`,
    );
    for (const row of rows) {
      for (const url of new Set(row.v.match(OLD_HOST_RE) ?? [])) {
        const where = `${c.table_name}.${c.column_name}`;
        const list = urls.get(url) ?? [];
        if (!list.includes(where)) list.push(where);
        urls.set(url, list);
      }
    }
  }
  return urls;
}

/** Readable title from a file URL ("25-hour-pranayama.webp" → "25 hour pranayama"). */
function titleFromUrl(url: string): string {
  const file = decodeURIComponent(url.split("/").pop() ?? "image");
  return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

/**
 * Downloads an old-site image and uploads it to Cloudinary.
 *
 * @param url - Old image URL
 */
async function uploadFromUrl(url: string) {
  const res = await fetch(url.replace(/ /g, "%20"), { headers: { "User-Agent": "nirvana-cms-migration" } });
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
  const mime = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!mime.startsWith("image/")) throw new Error(`not an image (${mime || "no type"})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 200) throw new Error(`file too small (${buffer.length} bytes)`);

  const safeName = titleFromUrl(url).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 48);
  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    bytes: number;
    width?: number;
    height?: number;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: FOLDER,
          public_id: `${safeName}-${Date.now()}`,
          resource_type: "image",
          overwrite: false,
        },
        (error, out) => (error || !out ? reject(error ?? new Error("upload failed")) : resolve(out)),
      )
      .end(buffer);
  });
  return { ...result, mime };
}

/**
 * Replaces one URL with another in every text / JSON column of the schema.
 *
 * @param pool - DB pool
 * @param columns - Candidate columns
 * @param from - Old URL
 * @param to - New URL
 */
async function replaceEverywhere(
  pool: Pg,
  columns: { table_name: string; column_name: string; data_type: string }[],
  from: string,
  to: string,
): Promise<number> {
  let changed = 0;
  for (const c of columns) {
    const cast = c.data_type === "jsonb" ? "::jsonb" : c.data_type === "json" ? "::json" : "";
    const res = await pool.query(
      `UPDATE "${c.table_name}" SET "${c.column_name}" = replace("${c.column_name}"::text, $1, $2)${cast}
        WHERE strpos("${c.column_name}"::text, $1) > 0`,
      [from, to],
    );
    changed += res.rowCount ?? 0;
  }
  return changed;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const all = process.argv.includes("--all");
  const type = arg("type");
  const slug = arg("slug");
  if (!all && !type && !slug)
    throw new Error("Pass --all, --type <page type> or --slug <page slug>.");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  const pool = getPool() as unknown as Pg;


  const { rows: allColumns } = await pool.query<{
    table_name: string;
    column_name: string;
    data_type: string;
  }>(
    `SELECT c.table_name, c.column_name, c.data_type
       FROM information_schema.columns c
       JOIN information_schema.tables t
         ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
        AND c.data_type IN ('text', 'character varying', 'jsonb', 'json')
        AND NOT (c.table_name = 'media_assets' AND c.column_name = 'description')`,
  );

  // Only columns that hold old-site URLs at all — scanning the rest per image
  // turns a few-minute run into an hour of no-op UPDATEs.
  const columns: typeof allColumns = [];
  for (const c of allColumns) {
    const hit = await pool.query(
      `SELECT 1 FROM "${c.table_name}"
        WHERE strpos("${c.column_name}"::text, 'nirvanayogaschoolindia.com/') > 0 LIMIT 1`,
    );
    if (hit.rows.length) columns.push(c);
  }
  console.log(`URLs will be replaced in ${columns.length} columns.`);

  const urls = all
    ? await collectAllUrls(pool, columns)
    : await collectUrls(pool, { type, slug });
  console.log(
    `${urls.size} old-site images used by ${all ? "the whole site" : type ? `${type} pages` : slug}.`,
  );

  const failures: string[] = [];
  let uploaded = 0;
  let reused = 0;

  for (const [oldUrl, pages] of urls) {
    const label = `${oldUrl.replace(/^https?:\/\/[^/]+/, "")} (${pages.length} ${all ? "column" : "page"}${pages.length > 1 ? "s" : ""})`;
    try {
      const existing = await pool.query<{ url: string }>(
        `SELECT url FROM media_assets WHERE description = $1 LIMIT 1`,
        [MIGRATED_PREFIX + oldUrl],
      );
      let newUrl = existing.rows[0]?.url;

      if (dryRun) {
        console.log(`  ${newUrl ? "reuse " : "upload"} ${label}`);
        continue;
      }

      if (newUrl) {
        reused++;
      } else {
        const up = await uploadFromUrl(oldUrl);
        newUrl = up.secure_url;
        const title = titleFromUrl(oldUrl);
        await pool.query(
          `INSERT INTO media_assets (id, url, cdn_key, mime, size_bytes, width, height, alt, caption, description, tags, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10::jsonb, CURRENT_TIMESTAMP)`,
          [
            createId(),
            up.secure_url,
            up.public_id,
            up.mime,
            up.bytes,
            up.width ?? null,
            up.height ?? null,
            title,
            MIGRATED_PREFIX + oldUrl,
            JSON.stringify([type ?? "migrated"]),
          ],
        );
        await pool.query(
          `INSERT INTO media_images (id, url, tag, title, alt, sort, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [createId(), up.secure_url, type ?? "migrated", title],
        );
        uploaded++;
      }

      const rows = await replaceEverywhere(pool, columns, oldUrl, newUrl);
      console.log(`  ok     ${label} → ${newUrl.split("/").pop()} (${rows} row${rows === 1 ? "" : "s"} updated)`);
    } catch (error) {
      failures.push(`${oldUrl}: ${(error as Error).message}`);
      console.log(`  FAILED ${label}: ${(error as Error).message}`);
    }
  }

  console.log(
    dryRun
      ? "\nDry run — nothing uploaded or changed."
      : `\nUploaded ${uploaded}, reused ${reused}, failed ${failures.length}.`,
  );
  if (failures.length) {
    console.log("Failed images keep their old URL:\n" + failures.map((f) => `  - ${f}`).join("\n"));
    process.exitCode = 1;
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
