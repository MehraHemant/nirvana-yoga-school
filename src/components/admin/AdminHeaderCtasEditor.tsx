"use client";

import type {
  HeaderCta,
  HeaderCtaVariant,
} from "@/content/types/global-settings";
import { NestedItemCard } from "./NestedItemCard";
import { SelectField } from "./SelectField";
import { reorderItems, SortableList, SortableRow } from "./SortableList";
import { TextField } from "./TextField";
import { useStableListKeys } from "./useStableListKeys";

const VARIANT_OPTIONS = [
  { value: "link", label: "Text link" },
  { value: "primary", label: "Primary button" },
  { value: "secondary", label: "Secondary button" },
];

type AdminHeaderCtasEditorProps = {
  /** Ordered CTA rows */
  ctas: HeaderCta[];
  /** Called with the full reordered / edited list */
  onChange: (ctas: HeaderCta[]) => void;
};

/**
 * Drag-reorderable editor for header CTAs (Enquire now, custom buttons).
 *
 * @param props - Current CTA list and change handler
 */
export function AdminHeaderCtasEditor({
  ctas,
  onChange,
}: AdminHeaderCtasEditorProps) {
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    ctas.length,
  );

  function updateRow(index: number, patch: Partial<HeaderCta>) {
    const next = ctas.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    onChange(next);
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(reorderItems(ctas, fromIndex, toIndex));
  }

  function addCta() {
    addKey();
    onChange([
      ...ctas,
      { label: "New CTA", href: "/", variant: "primary" as const },
    ]);
  }

  return (
    <div className="admin-field">
      <div className="admin-field-header">
        <div>
          <span className="admin-label">Header CTAs</span>
          <p className="admin-hint admin-hint--tight">
            Drag to reorder header actions (Enquire now or custom buttons).
          </p>
        </div>
        <button type="button" className="admin-btn-sm" onClick={addCta}>
          Add CTA
        </button>
      </div>

      {ctas.length === 0 ? (
        <p className="admin-hint">
          No CTAs yet. Add Enquire now or a custom button.
        </p>
      ) : (
        <SortableList
          ids={keys}
          onReorder={handleReorder}
          className="admin-nested-list"
        >
          {ctas.map((cta, index) => (
            <SortableRow key={keys[index]} id={keys[index]}>
              {({ dragHandleProps }) => (
                <NestedItemCard
                  title={cta.label.trim() || "CTA"}
                  index={index}
                  dragHandleProps={dragHandleProps}
                  onRemove={() => {
                    removeKey(index);
                    onChange(ctas.filter((_, i) => i !== index));
                  }}
                >
                  <div className="admin-field-grid">
                    <TextField
                      label="Label"
                      value={cta.label}
                      onChange={(value) => updateRow(index, { label: value })}
                      placeholder="Enquire Now"
                    />
                    <TextField
                      label="Link"
                      value={cta.href}
                      onChange={(value) => updateRow(index, { href: value })}
                      placeholder="/enquire-now"
                    />
                    <SelectField
                      label="Style"
                      value={cta.variant}
                      options={VARIANT_OPTIONS}
                      onChange={(value) =>
                        updateRow(index, {
                          variant: value as HeaderCtaVariant,
                        })
                      }
                    />
                  </div>
                </NestedItemCard>
              )}
            </SortableRow>
          ))}
        </SortableList>
      )}
    </div>
  );
}
