"use client";

import { useState } from "react";
import { ListRowActions } from "./ListRowActions";
import { reorderItems, SortableList, SortableRow } from "./SortableList";
import { useStableListKeys } from "./useStableListKeys";

type StringListFieldProps = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  placeholder?: string;
  hint?: string;
  allowBulkPaste?: boolean;
};

/**
 * Editable list of strings with drag reorder and optional bulk paste.
 *
 * @param props - List label, items, and change handler
 */
export function StringListField({
  label,
  items,
  onChange,
  addLabel = "Add item",
  placeholder = "Enter text…",
  hint,
  allowBulkPaste = true,
}: StringListFieldProps) {
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    items.length,
  );

  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    removeKey(index);
    onChange(items.filter((_, i) => i !== index));
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(reorderItems(items, fromIndex, toIndex));
  }

  function addItem(value = "") {
    addKey();
    onChange([...items, value]);
  }

  function applyBulkPaste() {
    const lines = pasteText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    // Length sync in useStableListKeys pads new keys for appended rows.
    onChange([...items.filter(Boolean), ...lines]);
    setPasteText("");
    setShowPaste(false);
  }

  return (
    <div className="admin-field">
      <div className="admin-field-header">
        <div>
          <span className="admin-label">{label}</span>
          {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}
        </div>
        <div className="admin-field-actions">
          {allowBulkPaste ? (
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => setShowPaste((value) => !value)}
            >
              {showPaste ? "Cancel paste" : "Paste many"}
            </button>
          ) : null}
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => addItem("")}
          >
            {addLabel}
          </button>
        </div>
      </div>

      {showPaste ? (
        <div className="admin-paste-box">
          <p className="admin-hint admin-hint--tight">
            Paste one item per line — they will be added to the list.
          </p>
          <textarea
            className="admin-textarea admin-textarea--compact"
            value={pasteText}
            placeholder={"Item one\nItem two\nItem three"}
            onChange={(event) => setPasteText(event.target.value)}
          />
          <button
            type="button"
            className="admin-btn-sm"
            onClick={applyBulkPaste}
          >
            Add all lines
          </button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="admin-empty-card">
          <p>No items yet.</p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => addItem("")}
          >
            {addLabel}
          </button>
        </div>
      ) : (
        <div className="admin-compact-table-scroll">
          <div className="admin-compact-table admin-compact-table--form">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                #
              </span>
              <span className="admin-compact-col admin-compact-col--value">
                Text
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <span className="sr-only">Actions</span>
              </span>
            </div>
            <SortableList ids={keys} onReorder={handleReorder}>
              {items.map((item, index) => (
                <SortableRow key={keys[index]} id={keys[index]}>
                  {({ dragHandleProps }) => (
                    <div className="admin-compact-table-row">
                      <span className="admin-compact-col admin-compact-col--num">
                        {index + 1}
                      </span>
                      <span className="admin-compact-col admin-compact-col--value">
                        <input
                          className="admin-input admin-input--compact"
                          value={item}
                          placeholder={placeholder}
                          onChange={(event) =>
                            updateItem(index, event.target.value)
                          }
                        />
                      </span>
                      <span className="admin-compact-col admin-compact-col--actions">
                        <ListRowActions
                          dragHandleProps={dragHandleProps}
                          onRemove={() => removeItem(index)}
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
  );
}
