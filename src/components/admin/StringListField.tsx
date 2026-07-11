"use client";

import { useState } from "react";
import { ListRowActions } from "./ListRowActions";

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
 * Editable list of strings with add/remove rows and optional bulk paste.
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

  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function applyBulkPaste() {
    const lines = pasteText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
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
            onClick={() => onChange([...items, ""])}
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
            onClick={() => onChange([""])}
          >
            {addLabel}
          </button>
        </div>
      ) : (
        <div className="admin-compact-table admin-compact-table--form">
          <div className="admin-compact-table-head admin-compact-table-row">
            <span className="admin-compact-col admin-compact-col--num">#</span>
            <span className="admin-compact-col admin-compact-col--value">
              {label}
            </span>
            <span className="admin-compact-col admin-compact-col--actions" />
          </div>
          {items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: list rows reorder by index
            <div key={`${label}-${index}`} className="admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                {index + 1}
              </span>
              <span className="admin-compact-col admin-compact-col--value">
                <input
                  className="admin-input admin-input--compact"
                  value={item}
                  placeholder={placeholder}
                  onChange={(event) => updateItem(index, event.target.value)}
                />
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <ListRowActions
                  index={index}
                  total={items.length}
                  onMoveUp={() => moveItem(index, -1)}
                  onMoveDown={() => moveItem(index, 1)}
                  onRemove={() => removeItem(index)}
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
