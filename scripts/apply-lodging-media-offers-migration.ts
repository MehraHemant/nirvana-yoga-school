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
});
