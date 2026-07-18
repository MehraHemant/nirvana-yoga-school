"use client";

import type { PricingBatch, PricingModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ImageField } from "../ImageField";
import { NestedItemCard } from "../NestedItemCard";
import { SectionIdField } from "../SectionIdField";
import { SelectField } from "../SelectField";
import {
  reorderItems,
  SortableList,
  SortableRow,
  withSortField,
} from "../SortableList";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type PricingModuleEditorProps = ModulePanelProps & {
  pricing: PricingModule;
  onChange: (pricing: PricingModule) => void;
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
 * Dates and pricing module editor — room options plus upcoming batches/seats.
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
}: PricingModuleEditorProps) {
  const batches = pricing.batches ?? [];
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    pricing.options.length,
  );
  const batchKeys = useStableListKeys(batches.length);

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    const options = withSortField(
      reorderItems(pricing.options, fromIndex, toIndex),
    ) as typeof pricing.options;
    onChange({ ...pricing, options });
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
      subtitle={`${pricing.options.length} options · ${batches.length} dates`}
      description={description}
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
        onChange={(description) => onChange({ ...pricing, description })}
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
            <span className="admin-label">Upcoming dates</span>
            <p className="admin-hint admin-hint--tight">
              Batch date ranges and seats left shown on the public Dates &amp;
              Fees section.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              batchKeys.addKey();
              const tone: PricingBatch["tone"] = "open";
              onChange({
                ...pricing,
                batches: [
                  ...batches,
                  {
                    dates: "",
                    spaces: "",
                    tone,
                    ...toneDefaults(tone),
                  },
                ],
              });
            }}
          >
            Add date
          </button>
        </div>
        {batches.length === 0 ? (
          <div className="admin-empty-card">
            <p>No batch dates yet. Add dates and seats left for this page.</p>
          </div>
        ) : (
          <div className="admin-pricing-batches">
            <SortableList ids={batchKeys.keys} onReorder={handleBatchReorder}>
              {batches.map((batch, index) => (
                <SortableRow
                  key={batchKeys.keys[index]}
                  id={batchKeys.keys[index]}
                >
                  {({ dragHandleProps }) => (
                    <NestedItemCard
                      title={batch.dates || "Batch date"}
                      index={index}
                      total={batches.length}
                      dragHandleProps={dragHandleProps}
                      onRemove={() => {
                        batchKeys.removeKey(index);
                        onChange({
                          ...pricing,
                          batches: batches.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      <TextField
                        label="Dates"
                        value={batch.dates}
                        onChange={(dates) => {
                          const next = [...batches];
                          next[index] = { ...batch, dates };
                          onChange({ ...pricing, batches: next });
                        }}
                        placeholder="2nd Jul to 26th Jul 2026"
                      />
                      <TextField
                        label="Seats left"
                        value={batch.spaces}
                        onChange={(spaces) => {
                          const next = [...batches];
                          next[index] = { ...batch, spaces };
                          onChange({ ...pricing, batches: next });
                        }}
                        placeholder="4 seats left"
                      />
                      <SelectField
                        label="Status tone"
                        value={batch.tone}
                        options={[...TONE_OPTIONS]}
                        onChange={(toneValue) => {
                          const tone = toneValue as PricingBatch["tone"];
                          const next = [...batches];
                          next[index] = {
                            ...batch,
                            tone,
                            ...toneDefaults(tone),
                          };
                          onChange({ ...pricing, batches: next });
                        }}
                      />
                      <p className="admin-pricing-batch-hint">
                        Shown as-is on the site (e.g. “4 seats left”).
                      </p>
                    </NestedItemCard>
                  )}
                </SortableRow>
              ))}
            </SortableList>
          </div>
        )}
      </div>

      <div className="admin-pricing-options">
        <SortableList ids={keys} onReorder={handleReorder}>
          {pricing.options.map((option, index) => (
            <SortableRow key={keys[index]} id={keys[index]}>
              {({ dragHandleProps }) => (
                <NestedItemCard
                  title={option.roomType || "Pricing option"}
                  index={index}
                  total={pricing.options.length}
                  dragHandleProps={dragHandleProps}
                  onRemove={() => {
                    removeKey(index);
                    onChange({
                      ...pricing,
                      options: pricing.options.filter((_, i) => i !== index),
                    });
                  }}
                >
                  <TextField
                    label="Room / package"
                    value={option.roomType}
                    onChange={(roomType) => {
                      const options = [...pricing.options];
                      options[index] = { ...option, roomType };
                      onChange({ ...pricing, options });
                    }}
                  />
                  <TextField
                    label="Price"
                    value={option.price}
                    onChange={(price) => {
                      const options = [...pricing.options];
                      options[index] = { ...option, price };
                      onChange({ ...pricing, options });
                    }}
                  />
                  <TextField
                    label="Original price"
                    value={option.originalPrice ?? ""}
                    onChange={(originalPrice) => {
                      const options = [...pricing.options];
                      options[index] = { ...option, originalPrice };
                      onChange({ ...pricing, options });
                    }}
                  />
                  <TextField
                    label="Description"
                    value={option.description}
                    onChange={(description) => {
                      const options = [...pricing.options];
                      options[index] = { ...option, description };
                      onChange({ ...pricing, options });
                    }}
                    multiline
                  />
                  <StringListField
                    label="Features"
                    items={option.features}
                    onChange={(features) => {
                      const options = [...pricing.options];
                      options[index] = { ...option, features };
                      onChange({ ...pricing, options });
                    }}
                  />
                  <ImageField
                    label="Room image"
                    value={option.image ?? ""}
                    onChange={(image) => {
                      const options = [...pricing.options];
                      options[index] = { ...option, image };
                      onChange({ ...pricing, options });
                    }}
                  />
                </NestedItemCard>
              )}
            </SortableRow>
          ))}
        </SortableList>
      </div>
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() => {
          addKey();
          onChange({
            ...pricing,
            options: [
              ...pricing.options,
              { roomType: "", price: "", description: "", features: [] },
            ],
          });
        }}
      >
        Add pricing option
      </button>
    </CollapsiblePanel>
  );
}
