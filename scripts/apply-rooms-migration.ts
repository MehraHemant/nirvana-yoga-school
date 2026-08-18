import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  COURSE_ROOM_CATALOG,
  RETREAT_ROOM_CATALOG,
  type RoomCatalogSeed,
} from "../src/content/lodging/room-catalog";
import { createId } from "../src/lib/db/ids";
import { getPool } from "../src/lib/db/node";

const migrationId = "0009_rooms";
const migrationPath = resolve(process.cwd(), "scripts/sql/0009_rooms.sql");
const PUBLIC_IMG = resolve(process.cwd(), "public/img/accommodation");

type SeedImage = { url: string; title: string; alt: string };

const COURSE_ROOMS: RoomCatalogSeed[] = COURSE_ROOM_CATALOG;
const RETREAT_ROOMS: RoomCatalogSeed[] = RETREAT_ROOM_CATALOG;
/**
 * Lists image files in a public accommodation folder as gallery entries.
 *
 * @param relativeFolder - Path under public/img/accommodation
 * @param title - Image title / alt base
 */
async function folderImages(
  relativeFolder: string,
  title: string,
): Promise<SeedImage[]> {
  if (!relativeFolder.trim()) return [];
  const dir = resolve(PUBLIC_IMG, relativeFolder);
  try {
    const entries = await readdir(dir);
    return entries
      .filter((name) => /\.(webp|jpe?g|png)$/i.test(name))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      )
      .map((name, index) => ({
        url: `/img/accommodation/${relativeFolder}/${name}`,
        title: `${title} ${index + 1}`,
        alt: `${title} ${index + 1}`,
      }));
  } catch {
    console.warn(`Missing image folder: ${dir}`);
    return [];
  }
}

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
 * Upserts seed rooms for a catalog — inserts missing slugs and refreshes
 * images from local public folders when present.
 *
 * @param client - Postgres client
 * @param catalog - course | retreat
 * @param rooms - Seed definitions
 */
async function seedCatalog(
  client: PgClient,
  catalog: "course" | "retreat",
  rooms: RoomCatalogSeed[],
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;
  for (const room of rooms) {
    const images = await folderImages(room.folder, room.name);
    const existing = await client.query(
      `SELECT "id" FROM "rooms" WHERE "catalog" = $1 AND "slug" = $2 LIMIT 1`,
      [catalog, room.slug],
    );
    const features = JSON.stringify(room.features ?? []);
    if (existing.rowCount) {
      // Always refresh name/description/features/sort; only overwrite images when local files exist.
      if (images.length > 0) {
        await client.query(
          `UPDATE "rooms"
           SET "name" = $3, "description" = $4, "features" = $5::jsonb, "images" = $6::jsonb, "sort" = $7, "updated_at" = CURRENT_TIMESTAMP
           WHERE "catalog" = $1 AND "slug" = $2`,
          [
            catalog,
            room.slug,
            room.name,
            room.description,
            features,
            JSON.stringify(images),
            room.sort,
          ],
        );
      } else {
        await client.query(
          `UPDATE "rooms"
           SET "name" = $3, "description" = $4, "features" = $5::jsonb, "sort" = $6, "updated_at" = CURRENT_TIMESTAMP
           WHERE "catalog" = $1 AND "slug" = $2`,
          [
            catalog,
            room.slug,
            room.name,
            room.description,
            features,
            room.sort,
          ],
        );
      }
      updated += 1;
      continue;
    }

    await client.query(
      `INSERT INTO "rooms"
        ("id", "catalog", "slug", "name", "description", "features", "images", "videos", "sort", "live")
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, '[]'::jsonb, $8, TRUE)`,
      [
        createId(),
        catalog,
        room.slug,
        room.name,
        room.description,
        features,
        JSON.stringify(images),
        room.sort,
      ],
    );
    inserted += 1;
  }
  return { inserted, updated };
}

/**
 * Deletes obsolete catalog rooms that were replaced by local-folder seeds.
 *
 * @param client - Postgres client
 * @param catalog - course | retreat
 * @param slugs - Slugs to remove
 */
async function deleteObsoleteRooms(
  client: PgClient,
  catalog: "course" | "retreat",
  slugs: string[],
): Promise<number> {
  if (slugs.length === 0) return 0;
  const result = await client.query(
    `DELETE FROM "rooms" WHERE "catalog" = $1 AND "slug" = ANY($2::text[])`,
    [catalog, slugs],
  );
  return result.rowCount ?? 0;
}

/**
 * Seeds or refreshes a global_settings food document gallery from local images.
 *
 * @param client - Postgres client
 * @param key - courseFood | retreatFood
 * @param folder - Image folder under accommodation
 * @param titlePrefix - Gallery title prefix
 */
async function seedFoodSetting(
  client: PgClient,
  key: "courseFood" | "retreatFood",
  folder: string,
  titlePrefix: string,
): Promise<"inserted" | "updated" | "skipped"> {
  const gallery = await folderImages(folder, titlePrefix);
  const value = {
    live: true,
    content: {
      title: "Sattvic meals",
      description:
        "Nourishing vegetarian meals prepared fresh each day — breakfast, lunch, and dinner included.",
      points: [
        "Fresh sattvic vegetarian meals three times a day",
        "Herbal tea and seasonal fruit",
        "Clean, mindful dining in community",
      ],
      dietaryNote:
        "Gluten-free and special dietary needs available on request.",
    },
    gallery,
  };

  const existing = await client.query(
    `SELECT "value" FROM "global_settings" WHERE "key" = $1 LIMIT 1`,
    [key],
  );
  if (!existing.rowCount) {
    await client.query(
      `INSERT INTO "global_settings" ("key", "value") VALUES ($1, $2::jsonb)`,
      [key, JSON.stringify(value)],
    );
    return "inserted";
  }

  const stored = existing.rows[0]?.value as
    | { gallery?: unknown[]; content?: { title?: string } }
    | undefined;
  const galleryEmpty =
    !Array.isArray(stored?.gallery) || stored.gallery.length === 0;
  const titleEmpty = !stored?.content?.title?.trim();
  if (galleryEmpty || titleEmpty) {
    await client.query(
      `UPDATE "global_settings" SET "value" = $2::jsonb WHERE "key" = $1`,
      [key, JSON.stringify(value)],
    );
    return "updated";
  }
  // Refresh gallery URLs to local paths when gallery exists but points elsewhere.
  if (gallery.length > 0) {
    const first =
      (stored?.gallery?.[0] as { url?: string } | undefined)?.url ?? "";
    if (!first.startsWith("/img/accommodation/")) {
      await client.query(
        `UPDATE "global_settings"
         SET "value" = jsonb_set(COALESCE("value", '{}'::jsonb), '{gallery}', $2::jsonb)
         WHERE "key" = $1`,
        [key, JSON.stringify(gallery)],
      );
      return "updated";
    }
  }
  return "skipped";
}

/**
 * Seeds stay/facilities meta when missing.
 *
 * @param client - Postgres client
 * @param key - residentialLife | retreatAccommodation
 * @param stayTitle - Default stay title
 */
async function seedAccommodationMeta(
  client: PgClient,
  key: "residentialLife" | "retreatAccommodation",
  stayTitle: string,
): Promise<boolean> {
  const existing = await client.query(
    `SELECT "key" FROM "global_settings" WHERE "key" = $1 LIMIT 1`,
    [key],
  );
  if (existing.rowCount) return false;

  const value =
    key === "residentialLife"
      ? {
          live: true,
          accommodation: {
            live: true,
            stay: {
              title: stayTitle,
              description:
                "Comfortable private and shared balcony rooms with Himalayan views and shared ashram amenities.",
            },
            galleries: [],
          },
          food: {
            live: true,
            content: {
              title: "",
              description: "",
              points: [],
              dietaryNote: "",
            },
            gallery: [],
          },
          facilities: [
            { label: "Free Wi‑Fi", iconKey: "wifi" },
            { label: "Hot water", iconKey: "flame" },
            { label: "Yoga hall", iconKey: "lotus" },
            { label: "Sattvic dining", iconKey: "bowl" },
          ],
        }
      : {
          live: true,
          lodgingLive: true,
          foodLive: true,
          accommodation: { live: true },
          food: { live: true },
          roomGalleries: [],
          foodGallery: [],
          mealHighlights: [],
          defaultFacilities: [
            "Free Wi‑Fi",
            "Hot water",
            "Yoga hall",
            "Sattvic dining",
          ],
        };

  await client.query(
    `INSERT INTO "global_settings" ("key", "value") VALUES ($1, $2::jsonb)`,
    [key, JSON.stringify(value)],
  );
  return true;
}

/**
 * Applies the rooms schema migration and seeds course/retreat catalogs + food.
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

    const courseSeed = await seedCatalog(client, "course", COURSE_ROOMS);
    const retreatSeed = await seedCatalog(client, "retreat", RETREAT_ROOMS);
    const obsoleteRetreat = await deleteObsoleteRooms(client, "retreat", [
      "private-balcony",
      "2-shared-balcony",
    ]);
    console.log(
      `Seeded rooms: course +${courseSeed.inserted}/~${courseSeed.updated}, retreat +${retreatSeed.inserted}/~${retreatSeed.updated}, obsolete retreat removed=${obsoleteRetreat}.`,
    );

    const courseFood = await seedFoodSetting(
      client,
      "courseFood",
      "course/food",
      "Course food",
    );
    const retreatFood = await seedFoodSetting(
      client,
      "retreatFood",
      "retreat/food",
      "Retreat food",
    );
    const courseMeta = await seedAccommodationMeta(
      client,
      "residentialLife",
      "Ashram lodging",
    );
    const retreatMeta = await seedAccommodationMeta(
      client,
      "retreatAccommodation",
      "Retreat lodging",
    );
    console.log(
      `Seeded settings: courseFood=${courseFood}, retreatFood=${retreatFood}, residentialLife=${courseMeta}, retreatAccommodation=${retreatMeta}.`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown migration error";
    throw new Error(`Neon rooms migration failed: ${message}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
