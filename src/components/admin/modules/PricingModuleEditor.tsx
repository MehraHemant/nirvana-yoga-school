"use client";

import type { PricingModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ImageField } from "../ImageField";
import { NestedItemCard } from "../NestedItemCard";
import {
  SortableList,
  SortableRow,
  reorderItems,
  withSortField,
} from "../SortableList";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { SectionIdField } from "../SectionIdField";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type PricingModuleEditorProps = ModulePanelProps & {
  pricing: PricingModule;
  onChange: (pricing: PricingModule) => void;
};

/**
 * Dates and pricing module editor.
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
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    pricing.options.length,
  );

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    const options = withSortField(
      reorderItems(pricing.options, fromIndex, toIndex),
    ) as typeof pricing.options;
    onChange({ ...pricing, options });
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Dates & pricing"
      subtitle={`${pricing.options.length} options`}
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
                <div className="admin-grid-2">
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
                </div>
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
