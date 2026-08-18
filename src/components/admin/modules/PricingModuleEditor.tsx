"use client";

import { useEffect, useState } from "react";
import type { PageRoomFee } from "@/content/mappers/page-room-fees";
import type { PricingBatch, PricingModule } from "@/content/types/page-modules";
import type { RoomCatalog, RoomRecord } from "@/content/types/shared-sections";
import { parseApiJson } from "@/lib/types/api";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ListRowActions } from "../ListRowActions";
import { SectionIdField } from "../SectionIdField";
import { reorderItems, SortableList, SortableRow } from "../SortableList";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type PricingModuleEditorProps = ModulePanelProps & {
  pricing: PricingModule;
  onChange: (pricing: PricingModule) => void;
  /** Shared rooms catalog for read-only fee summary */
  roomCatalog?: RoomCatalog;
  /** Page slug — used for copy only; fees come from lodging offers */
  pageSlug?: string;
  /** Read-only room fees from lodging / offers */
  roomFees?: Record<string, PageRoomFee>;
};

const TONE_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "fast", label: "Filling fast" },
  { value: "last", label: "Last seats" },
] as const;

/**
 * Builds status label + color classes from a batch tone.
 *
 * @param tone - Batch urgency tone
 */
function toneDefaults(
  tone: PricingBatch["tone"],
): Pick<PricingBatch, "status" | "statusColor"> {
  if (tone === "last") {
    return {
      status: "Last seats",
      statusColor: "text-rose-700 bg-rose-50 border-rose-200",
    };
  }
  if (tone === "fast") {
    return {
      status: "Filling Fast",
      statusColor: "text-amber-700 bg-amber-50 border-amber-200",
    };
  }
  return {
    status: "Open",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
  };
}

/**
 * Creates an empty open batch for the Add batch action.
 */
function createEmptyBatch(): PricingBatch {
  const tone: PricingBatch["tone"] = "open";
  return {
    dates: "",
    spaces: "",
    tone,
    ...toneDefaults(tone),
  };
}

/**
 * Dates & pricing module editor — manages date batches only.
 * Room name/price are read-only from shared catalog Live rooms / page offers.
 *
 * @param props - Pricing config and change handler
 */
export function PricingModuleEditor({
  pricing,
  onChange,
  panelId = "module-pricing",
  step = 9,
  description,
  open,
  onOpenChange,
  roomCatalog = "course",
  roomFees = {},
}: PricingModuleEditorProps) {
  const batches = pricing.batches ?? [];
  const batchKeys = useStableListKeys(batches.length);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/rooms?catalog=${roomCatalog}`)
      .then((res) => parseApiJson<{ rooms: RoomRecord[] }>(res))
      .then((body) => {
        if (!cancelled) setRooms(body.rooms ?? []);
      })
      .catch(() => {
        if (!cancelled) setRooms([]);
      });
    return () => {
      cancelled = true;
    };
  }, [roomCatalog]);

  const optionByRoomId = new Map(
    (pricing.options ?? [])
      .filter((option) => option.roomId)
      .map((option) => [option.roomId ?? "", option]),
  );

  // Admin Pricing lists all shared-catalog Live rooms (ignores per-page lodging Live).
  const sharedLiveRooms = rooms.filter((room) => room.live);

  const offerSummary =
    sharedLiveRooms.length > 0 || rooms.length > 0
      ? sharedLiveRooms.map((room) => {
          const option = optionByRoomId.get(room.id);
          const fee = roomFees[room.id];
          return {
            roomId: room.id,
            name: option?.roomType || room.name || room.slug,
            price: fee?.price || option?.price || "",
            originalPrice: fee?.originalPrice || option?.originalPrice || "",
          };
        })
      : (pricing.options ?? [])
          .filter((option) => Boolean(option.roomId))
          .map((option) => ({
            roomId: option.roomId ?? option.roomType,
            name: option.roomType || "Room",
            price: option.price || roomFees[option.roomId ?? ""]?.price || "",
            originalPrice:
              option.originalPrice ||
              roomFees[option.roomId ?? ""]?.originalPrice ||
              "",
          }));

  /**
   * Appends a new batch and writes through to `pricing.batches`.
   */
  function addBatch() {
    batchKeys.addKey();
    onChange({
      ...pricing,
      batches: [...batches, createEmptyBatch()],
    });
  }

  function handleBatchReorder(fromIndex: number, toIndex: number) {
    batchKeys.reorderKeys(fromIndex, toIndex);
    onChange({
      ...pricing,
      batches: reorderItems(batches, fromIndex, toIndex),
    });
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Dates & pricing"
      subtitle={`${offerSummary.length} rooms · ${batches.length} batches`}
      description={
        description ??
        "Manage upcoming batch dates. Room fees are edited under Lodging & food."
      }
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={pricing.live}
          onChange={(live) => onChange({ ...pricing, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={pricing._id}
        onChange={(_id) => onChange({ ...pricing, _id })}
      />
      <TextField
        label="Description"
        value={pricing.description}
        onChange={(descriptionValue) =>
          onChange({ ...pricing, description: descriptionValue })
        }
        multiline
      />
      <TextField
        label="Duration label"
        value={pricing.duration ?? ""}
        onChange={(duration) => onChange({ ...pricing, duration })}
      />

      <div className="admin-field">
        <div className="admin-field-header">
          <div>
            <span className="admin-label">Room fees (Shared Live rooms)</span>
            <p className="admin-hint admin-hint--tight">
              Read-only. Lists all rooms marked Live in Shared {roomCatalog}{" "}
              accommodation. Per-page lodging Live only affects the public
              accommodation gallery — set prices under Lodging &amp; food.
            </p>
          </div>
        </div>
        {offerSummary.length === 0 ? (
          <div className="admin-empty-card">
            <p>
              No Shared Live rooms yet. Mark rooms Live under Shared sections,
              then set prices under Lodging &amp; food.
            </p>
          </div>
        ) : (
          <div className="admin-compact-table-scroll">
            <div className="admin-compact-table admin-compact-table--pricing-fees">
              <div className="admin-compact-table-head admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  #
                </span>
                <span className="admin-compact-col admin-compact-col--name">
                  Room
                </span>
                <span className="admin-compact-col admin-compact-col--price">
                  Price
                </span>
                <span className="admin-compact-col admin-compact-col--price">
                  Original
                </span>
              </div>
              {offerSummary.map((row, index) => (
                <div key={row.roomId} className="admin-compact-table-row">
                  <span className="admin-compact-col admin-compact-col--num">
                    {index + 1}
                  </span>
                  <span className="admin-compact-col admin-compact-col--name">
                    <span className="admin-page-room-name">{row.name}</span>
                  </span>
                  <span className="admin-compact-col admin-compact-col--price admin-pricing-fee-value">
                    {row.price || "—"}
                  </span>
                  <span className="admin-compact-col admin-compact-col--price admin-pricing-fee-value admin-pricing-fee-value--muted">
                    {row.originalPrice || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="admin-field">
        <div className="admin-field-header">
          <div>
            <span className="admin-label">Batches</span>
            <p className="admin-hint admin-hint--tight">
              Date ranges, seats left, and status tone for the public Dates
              &amp; Fees section.
            </p>
          </div>
          <button type="button" className="admin-btn-sm" onClick={addBatch}>
            Add batch
          </button>
        </div>
        {batches.length === 0 ? (
          <div className="admin-empty-card">
            <p>No batches yet.</p>
            <button type="button" className="admin-btn-sm" onClick={addBatch}>
              Add batch
            </button>
          </div>
        ) : (
          <div className="admin-compact-table-scroll">
            <div className="admin-compact-table admin-compact-table--pricing-batches">
              <div className="admin-compact-table-head admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  #
                </span>
                <span className="admin-compact-col admin-compact-col--dates">
                  Dates
                </span>
                <span className="admin-compact-col admin-compact-col--seats">
                  Seats
                </span>
                <span className="admin-compact-col admin-compact-col--tone">
                  Tone
                </span>
                <span className="admin-compact-col admin-compact-col--actions">
                  <span className="sr-only">Actions</span>
                </span>
              </div>
              <SortableList ids={batchKeys.keys} onReorder={handleBatchReorder}>
                {batches.map((batch, index) => (
                  <SortableRow
                    key={batchKeys.keys[index]}
                    id={batchKeys.keys[index]}
                  >
                    {({ dragHandleProps }) => (
                      <div className="admin-compact-table-row">
                        <span className="admin-compact-col admin-compact-col--num">
                          {index + 1}
                        </span>
                        <span className="admin-compact-col admin-compact-col--dates">
                          <input
                            className="admin-input admin-input--compact"
                            value={batch.dates}
                            placeholder="2nd Jul to 26th Jul 2026"
                            aria-label={`Batch ${index + 1} dates`}
                            onChange={(event) => {
                              const next = [...batches];
                              next[index] = {
                                ...batch,
                                dates: event.target.value,
                              };
                              onChange({ ...pricing, batches: next });
                            }}
                          />
                        </span>
                        <span className="admin-compact-col admin-compact-col--seats">
                          <input
                            className="admin-input admin-input--compact"
                            value={batch.spaces}
                            placeholder="4 seats left"
                            aria-label={`Batch ${index + 1} seats`}
                            onChange={(event) => {
                              const next = [...batches];
                              next[index] = {
                                ...batch,
                                spaces: event.target.value,
                              };
                              onChange({ ...pricing, batches: next });
                            }}
                          />
                        </span>
                        <span className="admin-compact-col admin-compact-col--tone">
                          <select
                            className="admin-input admin-select admin-input--compact"
                            value={batch.tone}
                            aria-label={`Batch ${index + 1} tone`}
                            onChange={(event) => {
                              const tone = event.target
                                .value as PricingBatch["tone"];
                              const next = [...batches];
                              next[index] = {
                                ...batch,
                                tone,
                                ...toneDefaults(tone),
                              };
                              onChange({ ...pricing, batches: next });
                            }}
                          >
                            {TONE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </span>
                        <span className="admin-compact-col admin-compact-col--actions">
                          <ListRowActions
                            dragHandleProps={dragHandleProps}
                            onRemove={() => {
                              batchKeys.removeKey(index);
                              onChange({
                                ...pricing,
                                batches: batches.filter((_, i) => i !== index),
                              });
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </SortableRow>
                ))}
              </SortableList>
            </div>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}
