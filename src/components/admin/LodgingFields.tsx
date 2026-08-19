"use client";

import { roomDisplayTitle } from "@/content/lodging/room-catalog";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { SectionIdField } from "@/components/admin/SectionIdField";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { TextField } from "@/components/admin/TextField";
import type { PageRoomFee } from "@/content/mappers/page-room-fees";
import {
  normalizeResidentialLife,
  normalizeSharedFood,
} from "@/content/mappers/residential-life";
import {
  isPageRoomLive,
  setPageRoomLive,
} from "@/content/mappers/residential-life-utils";
import type {
  ResidentialLifeContent,
  RoomCatalog,
  RoomRecord,
} from "@/content/types/shared-sections";
import { parseApiJson } from "@/lib/types/api";

type ResidentialLifeFieldsProps = {
  /** Per-page lodging Live flags + room allowlist */
  doc: ResidentialLifeContent;
  /** Change handler for residentialLife */
  onChange: (next: ResidentialLifeContent) => void;
  /** Shared catalog this page type uses */
  catalog?: RoomCatalog;
  /** Page slug (offers dual-write on save via modules sync) */
  pageSlug?: string;
  /** Fees keyed by shared room id (from pricing.options or packages) */
  roomFees?: Record<string, PageRoomFee>;
  /**
   * Upserts price on the linked pricing option / package for this room.
   *
   * @param room - Shared catalog room
   * @param fee - Price fields
   */
  onRoomFeeChange?: (room: RoomRecord, fee: PageRoomFee) => void;
};

/**
 * Per-page Lodging & food panel — lists shared rooms with Live + inline prices,
 * plus section Live toggles and links to shared catalogs.
 *
 * @param props - Page lodging doc, catalog, and optional pricing sync
 */
export function ResidentialLifeFields({
  doc,
  onChange,
  catalog = "course",
  pageSlug: _pageSlug,
  roomFees = {},
  onRoomFeeChange,
}: ResidentialLifeFieldsProps) {
  const safeDoc = normalizeResidentialLife(doc);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [roomsError, setRoomsError] = useState("");
  const [sharedFoodTitle, setSharedFoodTitle] = useState("");

  useEffect(() => {
    let cancelled = false;
    setRoomsError("");
    fetch(`/api/admin/rooms?catalog=${catalog}`)
      .then((res) => parseApiJson<{ rooms: RoomRecord[] }>(res))
      .then((body) => {
        if (!cancelled) setRooms(body.rooms ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setRooms([]);
          setRoomsError("Could not load shared rooms.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [catalog]);

  useEffect(() => {
    let cancelled = false;
    const foodKey = catalog === "retreat" ? "retreatFood" : "courseFood";
    fetch(`/api/admin/settings/${foodKey}`)
      .then((res) => parseApiJson<{ settings: unknown }>(res))
      .then((foodBody) => {
        if (cancelled) return;
        const food = normalizeSharedFood(
          foodBody.settings as Parameters<typeof normalizeSharedFood>[0],
        );
        setSharedFoodTitle(food.content.title.trim());
      })
      .catch(() => {
        if (!cancelled) setSharedFoodTitle("");
      });
    return () => {
      cancelled = true;
    };
  }, [catalog]);

  const catalogRoomIds = rooms.map((room) => room.id);
  const sharedAccommodationHref =
    catalog === "retreat"
      ? "/admin/sections/shared#retreatAccommodation"
      : "/admin/sections/shared#residentialLife";
  const sharedFoodHref =
    catalog === "retreat"
      ? "/admin/sections/shared#retreatFood"
      : "/admin/sections/shared#courseFood";
  const accommodationLabel =
    catalog === "retreat" ? "Retreat accommodation" : "Course accommodation";
  const foodLabel = catalog === "retreat" ? "Retreat food" : "Course food";
  const liveRoomCount = rooms.filter((room) =>
    isPageRoomLive(room.id, safeDoc.accommodation.roomIds),
  ).length;

  /**
   * Toggles whether a shared room appears on this page.
   *
   * @param roomId - Shared room id
   * @param live - Next Live state
   */
  function toggleRoomLive(roomId: string, live: boolean) {
    onChange({
      ...safeDoc,
      accommodation: {
        ...safeDoc.accommodation,
        catalog,
        roomIds: setPageRoomLive(
          safeDoc.accommodation.roomIds,
          catalogRoomIds,
          roomId,
          live,
        ),
      },
    });
  }

  /**
   * Patches price fields and syncs the linked pricing option/package.
   *
   * @param room - Shared room
   * @param patch - Partial fee fields
   */
  function patchRoomFee(room: RoomRecord, patch: Partial<PageRoomFee>) {
    if (!onRoomFeeChange) return;
    const current = roomFees[room.id] ?? { price: "", originalPrice: "" };
    onRoomFeeChange(room, {
      price: patch.price ?? current.price,
      originalPrice:
        patch.originalPrice !== undefined
          ? patch.originalPrice
          : current.originalPrice,
    });
  }

  return (
    <>
      <div className="admin-lodging-shared-callout">
        <p className="admin-hint" style={{ margin: 0 }}>
          This page uses shared <strong>{accommodationLabel}</strong> and{" "}
          <strong>{foodLabel}</strong>. Toggle which rooms appear in the public
          accommodation gallery and set prices here — fees are the source of
          truth for Dates &amp; pricing (dates-only there).
        </p>
        <div className="admin-lodging-shared-callout__links">
          <Link href={sharedAccommodationHref} className="admin-btn-sm">
            Edit rooms &amp; stay
          </Link>
          <Link
            href={sharedFoodHref}
            className="admin-btn-sm admin-btn-sm--ghost"
          >
            Edit {foodLabel}
          </Link>
        </div>
      </div>

      <CollapsiblePanel
        title="Rooms on this page"
        subtitle={`${liveRoomCount} of ${rooms.length} Live`}
        description={`Shared ${catalog} rooms. Live controls the public accommodation gallery only. Fees still appear on Pricing when set.`}
        actions={
          <SectionLiveField
            id={`page-${catalog}-accommodation-live`}
            value={safeDoc.accommodation.live}
            onChange={(live) =>
              onChange({
                ...safeDoc,
                accommodation: {
                  ...safeDoc.accommodation,
                  catalog,
                  live,
                },
              })
            }
          />
        }
      >
        <SectionIdField
          fieldId={`page-${catalog}-accommodation-section-id`}
          value={safeDoc.accommodation._id}
          onChange={(_id) =>
            onChange({
              ...safeDoc,
              accommodation: {
                ...safeDoc.accommodation,
                catalog,
                _id,
              },
            })
          }
        />
        {roomsError ? <p className="admin-error">{roomsError}</p> : null}
        {rooms.length === 0 && !roomsError ? (
          <div className="admin-empty-card">
            <p>No shared {catalog} rooms yet.</p>
            <Link href={sharedAccommodationHref} className="admin-btn-sm">
              Add rooms in Shared sections
            </Link>
          </div>
        ) : rooms.length > 0 ? (
          <div className="admin-compact-table-scroll">
            <div className="admin-compact-table admin-compact-table--form admin-compact-table--page-rooms">
              <div className="admin-compact-table-head admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  #
                </span>
                <span className="admin-compact-col admin-compact-col--name">
                  Room
                </span>
                <span className="admin-compact-col admin-compact-col--live">
                  Live
                </span>
                <span className="admin-compact-col admin-compact-col--price">
                  Price
                </span>
                <span className="admin-compact-col admin-compact-col--price">
                  Original
                </span>
              </div>
              {rooms.map((room, index) => {
                const live = isPageRoomLive(
                  room.id,
                  safeDoc.accommodation.roomIds,
                );
                const displayTitle = roomDisplayTitle(room);
                const fee = roomFees[room.id] ?? {
                  price: "",
                  originalPrice: "",
                };
                return (
                  <div
                    key={room.id}
                    className={`admin-compact-table-row${live ? "" : " admin-compact-table-row--muted"}`}
                  >
                    <span className="admin-compact-col admin-compact-col--num">
                      {index + 1}
                    </span>
                    <span className="admin-compact-col admin-compact-col--name">
                      <span className="admin-page-room-name">
                        {displayTitle}
                      </span>
                      {!room.live ? (
                        <span className="admin-hint admin-hint--tight">
                          Hidden in shared catalog
                        </span>
                      ) : null}
                    </span>
                    <span className="admin-compact-col admin-compact-col--live">
                      <SectionLiveField
                        id={`page-${catalog}-room-${room.id}-live`}
                        value={live}
                        onChange={(nextLive) =>
                          toggleRoomLive(room.id, nextLive)
                        }
                      />
                    </span>
                    <span className="admin-compact-col admin-compact-col--price">
                      <input
                        className="admin-input admin-input--compact"
                        value={fee.price}
                        placeholder="e.g. $1299"
                        disabled={!onRoomFeeChange}
                        aria-label={`Price for ${displayTitle}`}
                        onChange={(event) =>
                          patchRoomFee(room, { price: event.target.value })
                        }
                      />
                    </span>
                    <span className="admin-compact-col admin-compact-col--price">
                      <input
                        className="admin-input admin-input--compact"
                        value={fee.originalPrice ?? ""}
                        placeholder="Optional"
                        disabled={!onRoomFeeChange}
                        aria-label={`Original price for ${displayTitle}`}
                        onChange={(event) =>
                          patchRoomFee(room, {
                            originalPrice: event.target.value,
                          })
                        }
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Food"
        description={`Shows shared ${catalog} food when Live.`}
        actions={
          <SectionLiveField
            id={`page-${catalog}-food-live`}
            value={safeDoc.food.live}
            onChange={(live) =>
              onChange({
                ...safeDoc,
                food: { ...safeDoc.food, live },
              })
            }
          />
        }
      >
        <SectionIdField
          fieldId={`page-${catalog}-food-section-id`}
          value={safeDoc.food._id}
          onChange={(_id) =>
            onChange({
              ...safeDoc,
              food: { ...safeDoc.food, _id },
            })
          }
        />
        <TextField
          label="Section title"
          hint={
            sharedFoodTitle
              ? `Leave blank to use shared default: “${sharedFoodTitle}”.`
              : "Leave blank to use the shared default intro heading on the public page."
          }
          value={safeDoc.food.content.title}
          onChange={(title) =>
            onChange({
              ...safeDoc,
              food: {
                ...safeDoc.food,
                content: { ...safeDoc.food.content, title },
              },
            })
          }
        />
      </CollapsiblePanel>
    </>
  );
}

export { ResidentialLifeFields as LodgingFields };
export type { SharedAccommodationMeta } from "@/components/admin/SharedLodgingEditors";
export {
  SharedAccommodationMetaFields,
  SharedFoodFields,
} from "@/components/admin/SharedLodgingEditors";
