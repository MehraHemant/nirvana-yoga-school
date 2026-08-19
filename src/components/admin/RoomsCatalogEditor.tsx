"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageListField } from "@/components/admin/ImageListField";
import { NestedItemCard } from "@/components/admin/NestedItemCard";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { VideoField } from "@/components/admin/VideoField";
import { roomDisplayTitle, roomMediaTag } from "@/content/lodging/room-catalog";
import type { CmsInteractiveImage } from "@/content/types/cms-image";
import type {
  RoomCatalog,
  RoomRecord,
  RoomVideo,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import { parseApiJson } from "@/lib/types/api";

/**
 * Maps CMS interactive images into the shared gallery image shape.
 *
 * @param items - Admin image list values
 */
function toSharedGalleryImages(
  items: CmsInteractiveImage[],
): SharedGalleryImage[] {
  return items.map((item) => ({
    url: item.url,
    title: item.alt?.trim() || "Gallery image",
    alt: item.alt,
    mediaAssetId: item.mediaAssetId,
    mediaImageId: item.mediaImageId,
    clickAction: item.clickAction,
    redirectUrl: item.redirectUrl,
  }));
}

/**
 * Maps shared gallery images into the admin ImageListField shape.
 *
 * @param images - Stored gallery images
 */
function toCmsImages(images: SharedGalleryImage[]): CmsInteractiveImage[] {
  return images.map((image) => ({
    url: image.url,
    alt: image.alt?.trim() || image.title,
    mediaAssetId: image.mediaAssetId,
    mediaImageId: image.mediaImageId,
    clickAction: image.clickAction ?? "fullscreen",
    redirectUrl: image.redirectUrl ?? "",
  }));
}

/**
 * Slugifies a room name for stable catalog keys.
 *
 * @param value - Display name
 */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

/**
 * Serializes rooms for dirty comparison (ignores DB timestamps).
 *
 * @param rooms - Room list
 */
function serializeRoomsForCompare(rooms: RoomRecord[]): string {
  return JSON.stringify(
    rooms.map(({ createdAt, updatedAt, ...room }) => room),
  );
}

/**
 * Builds the API payload for create/update room requests.
 *
 * @param catalog - Course or retreat catalog
 * @param room - Room draft
 */
function buildRoomPayload(catalog: RoomCatalog, room: RoomRecord) {
  return {
    catalog,
    slug: room.slug.trim() || slugify(room.name) || `room-${Date.now()}`,
    name: room.name.trim() || "Untitled room",
    title: room.title?.trim() ?? "",
    eyebrow: room.eyebrow?.trim() ?? "",
    description: room.description ?? "",
    features: room.features ?? [],
    images: room.images ?? [],
    videos: room.videos ?? [],
    sort: room.sort ?? 0,
    live: room.live !== false,
  };
}

export type RoomsCatalogEditorHandle = {
  /** Persists every room with unsaved edits. */
  saveAll: () => Promise<void>;
  /** Whether any room differs from the last saved snapshot. */
  hasUnsavedChanges: () => boolean;
};

type RoomsCatalogEditorProps = {
  /** Course or retreat catalog */
  catalog: RoomCatalog;
  /** Called when pending room edits change. */
  onDirtyChange?: (dirty: boolean) => void;
};

/**
 * Shared CMS editor for course or retreat room catalogs (DB-backed).
 *
 * @param props - Catalog scope
 */
export const RoomsCatalogEditor = forwardRef<
  RoomsCatalogEditorHandle,
  RoomsCatalogEditorProps
>(function RoomsCatalogEditor({ catalog, onDirtyChange }, ref) {
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedBaseline, setSavedBaseline] = useState("");
  const roomsRef = useRef(rooms);
  const savedBaselineRef = useRef(savedBaseline);
  roomsRef.current = rooms;
  savedBaselineRef.current = savedBaseline;
  const keys = useStableListKeys(rooms.length);
  const catalogLabel = catalog === "retreat" ? "Retreat" : "Course";

  const isDirty =
    !loading &&
    savedBaseline !== "" &&
    serializeRoomsForCompare(rooms) !== savedBaseline;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  /**
   * Updates local room list and the saved snapshot after a successful write.
   *
   * @param updater - Next room list
   */
  function commitRooms(updater: (prev: RoomRecord[]) => RoomRecord[]) {
    setRooms((prev) => {
      const next = updater(prev);
      const baseline = serializeRoomsForCompare(next);
      setSavedBaseline(baseline);
      savedBaselineRef.current = baseline;
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/admin/rooms?catalog=${catalog}`)
      .then((res) => parseApiJson<{ rooms: RoomRecord[] }>(res))
      .then((body) => {
        if (cancelled) return;
        const loaded = body.rooms ?? [];
        const baseline = serializeRoomsForCompare(loaded);
        setRooms(loaded);
        setSavedBaseline(baseline);
        savedBaselineRef.current = baseline;
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load rooms");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [catalog]);

  /**
   * Writes one room to the API.
   *
   * @param room - Room draft
   * @param isNew - Whether to POST a new room
   */
  async function persistRoom(
    room: RoomRecord,
    isNew: boolean,
  ): Promise<RoomRecord> {
    const payload = buildRoomPayload(catalog, room);
    if (isNew) {
      const body = await parseApiJson<{ room: RoomRecord }>(
        await fetch("/api/admin/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      return body.room;
    }
    const body = await parseApiJson<{ room: RoomRecord }>(
      await fetch(`/api/admin/rooms/${room.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
    return body.room;
  }

  /**
   * Persists one room create/update and refreshes local state.
   *
   * @param room - Room draft
   * @param isNew - Whether to POST a new room
   * @param rethrow - When true, propagate errors (used by saveAll)
   */
  async function saveRoom(
    room: RoomRecord,
    isNew: boolean,
    rethrow = false,
  ) {
    setSavingId(room.id);
    setError("");
    try {
      const saved = await persistRoom(room, isNew);
      commitRooms((prev) =>
        prev.map((item) => (item.id === room.id ? saved : item)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      if (rethrow) throw err;
    } finally {
      setSavingId(null);
    }
  }

  /**
   * Persists every room that differs from the saved snapshot.
   */
  async function saveAllRooms() {
    if (
      savedBaselineRef.current === "" ||
      serializeRoomsForCompare(roomsRef.current) === savedBaselineRef.current
    ) {
      return;
    }

    const savedRooms = JSON.parse(savedBaselineRef.current) as RoomRecord[];
    const savedById = new Map(savedRooms.map((room) => [room.id, room]));
    const pending = roomsRef.current.filter((room) => {
      if (room.id.startsWith("new-")) return true;
      const saved = savedById.get(room.id);
      if (!saved) return true;
      return (
        serializeRoomsForCompare([room]) !== serializeRoomsForCompare([saved])
      );
    });

    setError("");
    for (const room of pending) {
      const current =
        roomsRef.current.find((item) => item.id === room.id) ?? room;
      await saveRoom(current, current.id.startsWith("new-"), true);
    }
  }

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () =>
      savedBaselineRef.current !== "" &&
      serializeRoomsForCompare(roomsRef.current) !== savedBaselineRef.current,
    saveAll: saveAllRooms,
  }));

  /**
   * Deletes a room from the shared catalog.
   *
   * @param id - Room id
   * @param index - List index for key cleanup
   */
  async function removeRoom(id: string, index: number) {
    if (id.startsWith("new-")) {
      keys.removeKey(index);
      commitRooms((prev) => prev.filter((room) => room.id !== id));
      return;
    }
    setSavingId(id);
    setError("");
    try {
      await parseApiJson(
        await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" }),
      );
      keys.removeKey(index);
      commitRooms((prev) => prev.filter((room) => room.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSavingId(null);
    }
  }

  /**
   * Adds a blank room draft to the catalog list.
   */
  function addRoom() {
    keys.addKey();
    const draft: RoomRecord = {
      id: `new-${Date.now()}`,
      catalog,
      slug: "",
      name: "New room type",
      title: "",
      eyebrow: "",
      description: "",
      features: [],
      images: [],
      videos: [],
      sort: (rooms[rooms.length - 1]?.sort ?? 0) + 10,
      live: true,
    };
    setRooms((prev) => [...prev, draft]);
  }

  /**
   * Patches one room in local state.
   *
   * @param roomId - Room id
   * @param patch - Partial room fields
   */
  function patchRoom(roomId: string, patch: Partial<RoomRecord>) {
    setRooms((prev) =>
      prev.map((item) => (item.id === roomId ? { ...item, ...patch } : item)),
    );
  }

  return (
    <CollapsiblePanel
      id="lodging-rooms"
      title={`${catalogLabel} rooms`}
      subtitle={`${rooms.length} room type${rooms.length === 1 ? "" : "s"}`}
      defaultOpen
    >
      <div className="admin-rooms-catalog">
        {error ? <p className="admin-error">{error}</p> : null}

        <div className="admin-rooms-catalog__toolbar">
          <p className="admin-rooms-catalog__hint">
            Shared catalog for product pages · save on each card or the page Save
            bar
          </p>
          <button type="button" className="admin-btn-sm" onClick={addRoom}>
            Add room
          </button>
        </div>

        {loading ? <p className="admin-hint">Loading rooms…</p> : null}

        {!loading && rooms.length === 0 ? (
          <div className="admin-empty-card admin-rooms-catalog__empty">
            <p>
              No room types yet. Add the first shared room for{" "}
              {catalogLabel.toLowerCase()} pages.
            </p>
            <button type="button" className="admin-btn-sm" onClick={addRoom}>
              Add first room
            </button>
          </div>
        ) : null}

        <div className="admin-rooms-catalog__list">
          {rooms.map((room, index) => {
            const isNew = room.id.startsWith("new-");
            const videos = room.videos ?? [];
            const imageCount = room.images?.length ?? 0;
            return (
              <NestedItemCard
                key={keys.keys[index] ?? room.id}
                title={roomDisplayTitle(room)}
                subtitle={`${imageCount} image${imageCount === 1 ? "" : "s"}`}
                index={index}
                collapsible
                defaultOpen={isNew}
                onRemove={() => void removeRoom(room.id, index)}
                headerActions={
                  <SectionLiveField
                    id={`room-live-${room.id}`}
                    value={room.live}
                    onChange={(live) => patchRoom(room.id, { live })}
                  />
                }
              >
                <div className="admin-rooms-catalog__fields">
                  <TextField
                    label="Title"
                    value={room.title ?? ""}
                    onChange={(title) => patchRoom(room.id, { title })}
                    hint="Public label on course accommodation and lodging"
                  />
                  <TextField
                    label="Eyebrow"
                    value={room.eyebrow ?? ""}
                    onChange={(eyebrow) => patchRoom(room.id, { eyebrow })}
                    hint='Small label above the room selector when active (e.g. "Choose your room")'
                  />
                  <TextField
                    label="Name"
                    value={room.name}
                    onChange={(name) =>
                      patchRoom(room.id, {
                        name,
                        slug: room.slug || slugify(name),
                      })
                    }
                    hint="Internal identifier and media library tag"
                  />
                  <TextField
                    label="Description"
                    value={room.description}
                    onChange={(description) =>
                      patchRoom(room.id, { description })
                    }
                    multiline
                    rows={2}
                  />
                  <StringListField
                    label="Features"
                    items={room.features ?? []}
                    onChange={(features) => patchRoom(room.id, { features })}
                    addLabel="Add feature"
                    placeholder="e.g. Private balcony"
                    hint="Shown on public pricing cards for this room"
                  />

                  <details className="admin-rooms-catalog__advanced">
                    <summary>Slug &amp; sort</summary>
                    <div className="admin-rooms-catalog__advanced-body">
                      <TextField
                        label="Slug"
                        value={room.slug}
                        onChange={(slug) => patchRoom(room.id, { slug })}
                        hint="Unique key for this catalog"
                      />
                      <TextField
                        label="Sort order"
                        value={String(room.sort ?? 0)}
                        onChange={(value) =>
                          patchRoom(room.id, { sort: Number(value) || 0 })
                        }
                        hint="Lower numbers appear first"
                      />
                    </div>
                  </details>
                </div>

                <div className="admin-rooms-catalog__media">
                  <ImageListField
                    label="Room images"
                    layout="gallery"
                    librarySource="lodging"
                    libraryTag={roomMediaTag(room.name)}
                    defaultTags={
                      room.name.trim() ? [roomMediaTag(room.name)] : []
                    }
                    hint="Library or upload — tag matches room category"
                    items={toCmsImages(room.images ?? [])}
                    onChange={(items) =>
                      patchRoom(room.id, {
                        images: toSharedGalleryImages(items),
                      })
                    }
                  />

                  <div className="admin-field">
                    <div className="admin-field-header">
                      <div>
                        <span className="admin-label">Videos</span>
                        <p className="admin-hint admin-hint--tight">
                          Optional walkthrough clips
                        </p>
                      </div>
                      <button
                        type="button"
                        className="admin-btn-sm"
                        onClick={() => {
                          const nextVideos: RoomVideo[] = [
                            ...videos,
                            { url: "", title: "" },
                          ];
                          patchRoom(room.id, { videos: nextVideos });
                        }}
                      >
                        Add video
                      </button>
                    </div>
                    {videos.length === 0 ? (
                      <p className="admin-hint admin-hint--tight">
                        No videos yet.
                      </p>
                    ) : (
                      <div className="admin-rooms-catalog__videos">
                        {videos.map((video, videoIndex) => (
                          <div
                            key={`${room.id}-video-${videoIndex}`}
                            className="admin-rooms-catalog__video-row"
                          >
                            <VideoField
                              label={`Video ${videoIndex + 1}`}
                              value={video.url}
                              onChange={(url) => {
                                const nextVideos = [...videos];
                                nextVideos[videoIndex] = { ...video, url };
                                patchRoom(room.id, { videos: nextVideos });
                              }}
                            />
                            <button
                              type="button"
                              className="admin-btn-sm admin-btn-sm--ghost"
                              onClick={() => {
                                const nextVideos = videos.filter(
                                  (_, i) => i !== videoIndex,
                                );
                                patchRoom(room.id, { videos: nextVideos });
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-rooms-catalog__footer">
                  <p className="admin-rooms-catalog__footer-note">
                    Room fields save here or with the page Save bar below
                  </p>
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--primary"
                    disabled={savingId === room.id}
                    onClick={() => void saveRoom(room, isNew)}
                  >
                    {savingId === room.id
                      ? "Saving…"
                      : isNew
                        ? "Create room"
                        : "Save this room"}
                  </button>
                </div>
              </NestedItemCard>
            );
          })}
        </div>
      </div>
    </CollapsiblePanel>
  );
});
