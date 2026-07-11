"use client";

import type { PricingModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ImageField } from "../ImageField";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import { NestedItemCard } from "../NestedItemCard";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
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
  hideLibraryActions = false,
}: PricingModuleEditorProps) {
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
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="pricing"
            payload={pricing}
            hasContent={pricing.options.length > 0}
            onInsert={(payload) => onChange(payload as PricingModule)}
          />
        )
      }
    >
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
      {pricing.options.map((option, index) => (
        <NestedItemCard
          // biome-ignore lint/suspicious/noArrayIndexKey: pricing rows lack stable ids
          key={`pricing-${index}`}
          title={option.roomType || "Pricing option"}
          index={index}
          total={pricing.options.length}
          onRemove={() =>
            onChange({
              ...pricing,
              options: pricing.options.filter((_, i) => i !== index),
            })
          }
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
      ))}
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() =>
          onChange({
            ...pricing,
            options: [
              ...pricing.options,
              { roomType: "", price: "", description: "", features: [] },
            ],
          })
        }
      >
        Add pricing option
      </button>
    </CollapsiblePanel>
  );
}
