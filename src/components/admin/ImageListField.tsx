"use client";

import {
  type CmsInteractiveImage,
  normalizeCmsImage,
} from "@/content/types/cms-image";
import { ImageField } from "./ImageField";
import { ListRowActions } from "./ListRowActions";
import { reorderItems, SortableList, SortableRow } from "./SortableList";
import { useStableListKeys } from "./useStableListKeys";

type ImageListFieldProps = {
  label: string;
  /** Legacy URL strings or rich interactive images */
  items: Array<string | CmsInteractiveImage>;
  onChange: (items: CmsInteractiveImage[]) => void;
  addLabel?: string;
  hint?: string;
};

/**
 * Editable image gallery as a compact table — preview, alt text, and drag reorder.
 *
 * @param props - Label, image items, and change handler
 */
export function ImageListField({
  label,
  items,
  onChange,
  addLabel = "Add image",
  hint,
}: ImageListFieldProps) {
  const normalized = items.map(normalizeCmsImage);
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    normalized.length,
  );

  function updateItem(index: number, next: CmsInteractiveImage) {
    const copy = [...normalized];
    copy[index] = normalizeCmsImage(next);
    onChange(copy);
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(reorderItems(normalized, fromIndex, toIndex));
  }

  function addItem() {
    addKey();
    onChange([...normalized, { url: "", alt: "", clickAction: "fullscreen" }]);
  }

  return (
    <div className="admin-field">
      <div className="admin-field-header">
        <div>
          <span className="admin-label">{label}</span>
          {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}
        </div>
        <button type="button" className="admin-btn-sm" onClick={addItem}>
          {addLabel}
        </button>
      </div>

      {normalized.length === 0 ? (
        <div className="admin-empty-card">
          <p>No images yet.</p>
          <button type="button" className="admin-btn-sm" onClick={addItem}>
            {addLabel}
          </button>
        </div>
      ) : (
        <div className="admin-compact-table-scroll">
          <div className="admin-compact-table admin-compact-table--form admin-compact-table--images">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                #
              </span>
              <span className="admin-compact-col admin-compact-col--image">
                Image
              </span>
              <span className="admin-compact-col admin-compact-col--alt">
                Alt text
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <span className="sr-only">Actions</span>
              </span>
            </div>

            <SortableList ids={keys} onReorder={handleReorder}>
              {normalized.map((item, index) => {
                const idPrefix = keys[index] ?? `img-${index}`;
                return (
                  <SortableRow key={keys[index]} id={keys[index]}>
                    {({ dragHandleProps }) => (
                      <div className="admin-compact-table-row admin-compact-table-row--tall">
                        <span className="admin-compact-col admin-compact-col--num">
                          {index + 1}
                        </span>
                        <span className="admin-compact-col admin-compact-col--image">
                          <div className="admin-image-cell">
                            <ImageField
                              label={`Gallery image ${index + 1}`}
                              value={item.url}
                              hideLabel
                              compact
                              onChange={(url) =>
                                updateItem(index, { ...item, url })
                              }
                            />
                          </div>
                        </span>
                        <span className="admin-compact-col admin-compact-col--alt">
                          <input
                            id={`${idPrefix}-alt`}
                            className="admin-input admin-input--compact"
                            type="text"
                            value={item.alt ?? ""}
                            placeholder="Describe the image"
                            aria-label={`Alt text for image ${index + 1}`}
                            onChange={(event) =>
                              updateItem(index, {
                                ...item,
                                alt: event.target.value,
                              })
                            }
                          />
                        </span>
                        <span className="admin-compact-col admin-compact-col--actions">
                          <ListRowActions
                            dragHandleProps={dragHandleProps}
                            onRemove={() => {
                              removeKey(index);
                              onChange(
                                normalized.filter((_, i) => i !== index),
                              );
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </SortableRow>
                );
              })}
            </SortableList>
          </div>
        </div>
      )}
    </div>
  );
}
