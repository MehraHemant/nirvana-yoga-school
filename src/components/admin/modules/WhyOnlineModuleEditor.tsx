"use client";

import type { WhyOnlineModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { NestedItemCard } from "../NestedItemCard";
import { SectionIdField } from "../SectionIdField";
import { reorderItems, SortableList, SortableRow } from "../SortableList";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type WhyOnlineModuleEditorProps = ModulePanelProps & {
  whyOnline: WhyOnlineModule;
  onChange: (whyOnline: WhyOnlineModule) => void;
};

/**
 * Why-online benefits editor for the online courses hub.
 *
 * @param props - Why-online config and change handler
 */
export function WhyOnlineModuleEditor({
  whyOnline,
  onChange,
  panelId = "module-why-online",
  step = 4,
  description,
  open,
  onOpenChange,
}: WhyOnlineModuleEditorProps) {
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    whyOnline.items.length,
  );

  /**
   * Reorders benefit rows after a drag.
   *
   * @param fromIndex - Source index
   * @param toIndex - Destination index
   */
  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange({
      ...whyOnline,
      items: reorderItems(whyOnline.items, fromIndex, toIndex),
    });
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Why online"
      subtitle={`${whyOnline.items.length} benefits`}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={whyOnline.live}
          onChange={(live) => onChange({ ...whyOnline, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={whyOnline._id}
        onChange={(_id) => onChange({ ...whyOnline, _id })}
      />
      <TextField
        label="Eyebrow"
        value={whyOnline.eyebrow ?? ""}
        onChange={(eyebrow) => onChange({ ...whyOnline, eyebrow })}
      />
      <TextField
        label="Title"
        value={whyOnline.title ?? ""}
        onChange={(title) => onChange({ ...whyOnline, title })}
      />
      <TextField
        label="Description"
        value={whyOnline.description ?? ""}
        onChange={(nextDescription) =>
          onChange({ ...whyOnline, description: nextDescription })
        }
        multiline
      />

      <div className="admin-field">
        <div className="admin-field-header">
          <span className="admin-label">Benefits</span>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              addKey();
              onChange({
                ...whyOnline,
                items: [...whyOnline.items, { title: "", description: "" }],
              });
            }}
          >
            Add benefit
          </button>
        </div>

        {whyOnline.items.length === 0 ? (
          <p className="admin-hint">No benefits yet.</p>
        ) : (
          <SortableList
            ids={keys}
            onReorder={handleReorder}
            className="admin-nested-list"
          >
            {whyOnline.items.map((item, index) => (
              <SortableRow key={keys[index]} id={keys[index]}>
                {({ dragHandleProps }) => (
                  <NestedItemCard
                    title={item.title.trim() || "Benefit"}
                    index={index}
                    total={whyOnline.items.length}
                    dragHandleProps={dragHandleProps}
                    onRemove={() => {
                      removeKey(index);
                      onChange({
                        ...whyOnline,
                        items: whyOnline.items.filter((_, i) => i !== index),
                      });
                    }}
                  >
                    <TextField
                      label="Title"
                      value={item.title}
                      onChange={(title) => {
                        const items = whyOnline.items.map((row, i) =>
                          i === index ? { ...row, title } : row,
                        );
                        onChange({ ...whyOnline, items });
                      }}
                    />
                    <TextField
                      label="Description"
                      value={item.description}
                      onChange={(nextDescription) => {
                        const items = whyOnline.items.map((row, i) =>
                          i === index
                            ? { ...row, description: nextDescription }
                            : row,
                        );
                        onChange({ ...whyOnline, items });
                      }}
                      multiline
                    />
                  </NestedItemCard>
                )}
              </SortableRow>
            ))}
          </SortableList>
        )}
      </div>
    </CollapsiblePanel>
  );
}
