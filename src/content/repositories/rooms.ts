import { roomDisplayTitle, roomMediaTag } from "@/content/lodging/room-catalog";
import type {
  RoomCatalog,
  RoomRecord,
  RoomVideo,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import { invalidateGlobalSettingsCache } from "@/lib/cms/cache";
import { createId, db } from "@/lib/db";
import { requireDb } from "./db-fallback";
import type { ContentResult, RepositoryOptions } from "./fetch";
import {
  getRoomMediaImagesByRoomIds,
  setRoomImages,
  upsertMediaImage,
} from "./lodging";

const ROOMS_CACHE_KEY = "rooms";

/**
 * Busts the rooms list cache after admin writes.
 */
export function invalidateRoomsCache(): void {
  invalidateGlobalSettingsCache(ROOMS_CACHE_KEY);
}

/**
 * Resolves a gallery image to a media_images row, preferring a known id.
 *
 * @param image - Gallery image (optional mediaImageId)
 * @param sort - Sort order for upserts
 * @param tag - Lodging media tag (room display name)
 */
async function resolveRoomMediaImage(
  image: SharedGalleryImage,
  sort: number,
  tag: string,
): Promise<{ id: string; url: string; title: string; alt: string } | null> {
  const url = image.url?.trim();
  if (!url) return null;
  const title = image.title?.trim() || image.alt?.trim() || "Gallery image";
  const alt = image.alt?.trim() || title;
  const knownId = image.mediaImageId?.trim();
  const mediaTag = roomMediaTag(tag);

  if (knownId) {
    const existing = await db.mediaImage.findUnique({ where: { id: knownId } });
    if (existing) {
      const row = existing as { id: string; url?: string; tag?: string };
      if (mediaTag && row.tag !== mediaTag) {
        await db.mediaImage.update({
          where: { id: row.id },
          data: { tag: mediaTag },
        });
      }
      return {
        id: row.id,
        url: String(row.url ?? url),
        title,
        alt,
      };
    }
  }

  const record = await upsertMediaImage({
    url,
    tag: mediaTag,
    title,
    alt,
    sort,
  });
  return {
    id: record.id,
    url: record.url,
    title: record.title || title,
    alt: record.alt || alt,
  };
}

/**
 * Upserts gallery URLs into media_images and rewrites room_images links.
 *
 * @param roomId - Room id
 * @param images - Ordered gallery images (optional mediaImageId)
 * @param tag - Lodging media tag (room display name)
 */
async function syncRoomImageLinks(
  roomId: string,
  images: SharedGalleryImage[],
  tag: string,
): Promise<SharedGalleryImage[]> {
  const mediaImageIds: string[] = [];
  const synced: SharedGalleryImage[] = [];
  const seenIds = new Set<string>();

  for (const [index, image] of images.entries()) {
    const record = await resolveRoomMediaImage(image, index, tag);
    if (!record) continue;
    // room_images has a unique (room_id, media_image_id) constraint
    if (seenIds.has(record.id)) continue;
    seenIds.add(record.id);

    mediaImageIds.push(record.id);
    synced.push({
      url: record.url,
      title: record.title,
      alt: record.alt,
      mediaAssetId: image.mediaAssetId,
      mediaImageId: record.id,
      clickAction: image.clickAction,
      redirectUrl: image.redirectUrl,
    });
  }

  await setRoomImages(roomId, mediaImageIds);
  return synced;
}

/**
 * Maps a raw DB row into a typed room record.
 *
 * @param row - Neon rooms row
 * @param imagesOverride - Images from room_images junction when present
 */
function mapRoomRow(
  row: Record<string, unknown>,
  imagesOverride?: SharedGalleryImage[],
): RoomRecord {
  const legacyImages = Array.isArray(row.images)
    ? (row.images as SharedGalleryImage[])
    : [];
  const features = Array.isArray(row.features)
    ? (row.features as unknown[])
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    : [];
  return {
    id: String(row.id ?? ""),
    catalog: row.catalog === "retreat" ? "retreat" : "course",
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    title: String(row.title ?? ""),
    eyebrow: String(row.eyebrow ?? ""),
    description: String(row.description ?? ""),
    features,
    images:
      imagesOverride && imagesOverride.length > 0
        ? imagesOverride
        : legacyImages,
    videos: Array.isArray(row.videos) ? (row.videos as RoomVideo[]) : [],
    sort: typeof row.sort === "number" ? row.sort : Number(row.sort ?? 0),
    live: row.live !== false && row.live !== 0,
    createdAt: row.createdAt as string | Date | undefined,
    updatedAt: row.updatedAt as string | Date | undefined,
  };
}

/**
 * Attaches junction-table media to mapped rooms (falls back to JSONB images).
 *
 * @param rows - Raw room rows
 */
async function mapRoomsWithMedia(
  rows: Record<string, unknown>[],
): Promise<RoomRecord[]> {
  const ids = rows.map((row) => String(row.id ?? "")).filter(Boolean);
  const media = await getRoomMediaImagesByRoomIds(ids);
  return rows.map((row) => mapRoomRow(row, media.get(String(row.id ?? ""))));
}

/**
 * Lists rooms for a catalog, ordered by sort then name.
 *
 * @param catalog - Course or retreat catalog
 * @param options - Repository options
 * @param liveOnly - When true, exclude unpublished rooms
 */
export async function getRooms(
  catalog: RoomCatalog,
  options?: RepositoryOptions,
  liveOnly = false,
): Promise<ContentResult<RoomRecord[]>> {
  return requireDb(async () => {
    const rows = await db.room.findMany({
      where: liveOnly ? { catalog, live: true } : { catalog },
      orderBy: [{ sort: "asc" }, { name: "asc" }],
    });
    return mapRoomsWithMedia(rows as Record<string, unknown>[]);
  }, options);
}

/**
 * Loads rooms by id, preserving requested order when possible.
 *
 * @param ids - Room ids
 * @param options - Repository options
 */
export async function getRoomsByIds(
  ids: string[],
  options?: RepositoryOptions,
): Promise<ContentResult<RoomRecord[]>> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return { data: [], source: "db" };
  }
  return requireDb(async () => {
    const rows = await db.room.findMany({
      where: { id: { in: unique } },
    });
    const mapped = await mapRoomsWithMedia(rows as Record<string, unknown>[]);
    const byId = new Map(mapped.map((room) => [room.id, room]));
    return unique
      .map((id) => byId.get(id))
      .filter((room): room is RoomRecord => Boolean(room));
  }, options);
}

export type UpsertRoomInput = {
  catalog: RoomCatalog;
  slug: string;
  name: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  features?: string[];
  images?: SharedGalleryImage[];
  videos?: RoomVideo[];
  sort?: number;
  live?: boolean;
};

/**
 * Creates a room in the shared catalog.
 *
 * @param input - Room fields
 */
export async function createRoom(input: UpsertRoomInput): Promise<RoomRecord> {
  const images = input.images ?? [];
  const features = (input.features ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
  const row = await db.room.create({
    data: {
      id: createId(),
      catalog: input.catalog,
      slug: input.slug.trim(),
      name: input.name.trim(),
      title: input.title?.trim() ?? "",
      eyebrow: input.eyebrow?.trim() ?? "",
      description: input.description?.trim() ?? "",
      features,
      images,
      videos: input.videos ?? [],
      sort: input.sort ?? 0,
      live: input.live !== false,
    },
  });
  const roomId = String((row as { id: string }).id);
  const name = input.name.trim();
  const syncedImages = await syncRoomImageLinks(roomId, images, name);
  if (syncedImages.length > 0 || images.length > 0) {
    await db.room.update({
      where: { id: roomId },
      data: { images: syncedImages },
    });
  }
  invalidateRoomsCache();
  return mapRoomRow(
    { ...(row as Record<string, unknown>), images: syncedImages, features },
    syncedImages,
  );
}

/**
 * Updates an existing room.
 *
 * @param id - Room id
 * @param input - Partial room fields
 */
export async function updateRoom(
  id: string,
  input: Partial<UpsertRoomInput> & { live?: boolean },
): Promise<RoomRecord> {
  const data: Record<string, unknown> = {};
  if (input.catalog !== undefined) data.catalog = input.catalog;
  if (input.slug !== undefined) data.slug = input.slug.trim();
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.eyebrow !== undefined) data.eyebrow = input.eyebrow.trim();
  if (input.description !== undefined) {
    data.description = input.description.trim();
  }
  if (input.features !== undefined) {
    data.features = input.features.map((item) => item.trim()).filter(Boolean);
  }
  if (input.videos !== undefined) data.videos = input.videos;
  if (input.sort !== undefined) data.sort = input.sort;
  if (input.live !== undefined) data.live = input.live;

  let syncedImages: SharedGalleryImage[] | undefined;
  if (input.images !== undefined) {
    const existing =
      input.name === undefined
        ? await db.room.findUnique({
            where: { id },
            select: { name: true },
          })
        : null;
    const tag =
      input.name?.trim() ||
      String((existing as { name?: string } | null)?.name ?? "");
    syncedImages = await syncRoomImageLinks(id, input.images, tag);
    data.images = syncedImages;
  } else if (input.name !== undefined) {
    // Keep linked media tags aligned when the room display name changes.
    const linked = await getRoomMediaImagesByRoomIds([id]);
    const images = linked.get(id) ?? [];
    if (images.length > 0) {
      syncedImages = await syncRoomImageLinks(id, images, input.name.trim());
      data.images = syncedImages;
    }
  }

  const row = await db.room.update({
    where: { id },
    data,
  });
  invalidateRoomsCache();
  return mapRoomRow(row as Record<string, unknown>, syncedImages);
}

/**
 * Deletes a room by id.
 *
 * @param id - Room id
 */
export async function deleteRoom(id: string): Promise<void> {
  await db.room.delete({ where: { id } });
  invalidateRoomsCache();
}

/**
 * Maps a room into the Accommodation gallery tab shape.
 *
 * @param room - Shared room record
 */
export function roomToGallery(room: RoomRecord) {
  return {
    id: room.id,
    label: roomDisplayTitle(room),
    description: room.description,
    images: room.images,
    eyebrow: room.eyebrow?.trim() || undefined,
  };
}
