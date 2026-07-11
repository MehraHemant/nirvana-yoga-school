"use client";

import type { SitePageSubsection } from "@/content/types";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ImageField } from "./ImageField";
import { StringListField } from "./StringListField";
import { TextField } from "./TextField";

type SubsectionEditorProps = {
  subsection: SitePageSubsection;
  index: number;
  onChange: (subsection: SitePageSubsection) => void;
  onRemove: () => void;
};

/**
 * Editor for a single page subsection (title, body, image, list items).
 *
 * @param props - Subsection data and change handlers
 */
export function SubsectionEditor({
  subsection,
  index,
  onChange,
  onRemove,
}: SubsectionEditorProps) {
  return (
    <CollapsiblePanel
      title={subsection.title || `Subsection ${index + 1}`}
      subtitle="FAQ block, pricing row, or nested content"
      actions={
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={onRemove}
        >
          Remove
        </button>
      }
    >
      <TextField
        label="Title"
        value={subsection.title}
        onChange={(title) => onChange({ ...subsection, title })}
      />
      <TextField
        label="Body"
        value={subsection.body ?? ""}
        onChange={(body) => onChange({ ...subsection, body })}
        multiline
        rows={5}
      />
      <ImageField
        label="Image"
        value={subsection.image ?? ""}
        onChange={(image) => onChange({ ...subsection, image })}
      />
      <StringListField
        label="List items"
        items={subsection.items ?? []}
        onChange={(items) => onChange({ ...subsection, items })}
        addLabel="Add list item"
      />
    </CollapsiblePanel>
  );
}
