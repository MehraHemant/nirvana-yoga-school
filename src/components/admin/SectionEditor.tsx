"use client";

import type { SitePageSection, SitePageSubsection } from "@/content/types";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ImageField } from "./ImageField";
import { SectionIdField } from "./SectionIdField";
import { DragHandle, type DragHandleProps } from "./SortableList";
import { StringListField } from "./StringListField";
import { SubsectionEditor } from "./SubsectionEditor";
import { toSectionDomId } from "./sectionDomId";
import { TextField } from "./TextField";
import { useStableListKeys } from "./useStableListKeys";

const LAYOUTS: SitePageSection["layout"][] = [
  "default",
  "timeline",
  "split-media",
  "faq",
];

type SectionEditorProps = {
  section: SitePageSection;
  index: number;
  onChange: (section: SitePageSection) => void;
  onRemove: () => void;
  /** Drag handle props from a parent {@link SortableRow} */
  dragHandleProps?: DragHandleProps;
};

/**
 * Full editor for one page content section.
 *
 * @param props - Section data, index, and change handlers
 */
export function SectionEditor({
  section,
  index,
  onChange,
  onRemove,
  dragHandleProps,
}: SectionEditorProps) {
  const subsections = section.subsections ?? [];
  const { keys, addKey, removeKey } = useStableListKeys(subsections.length);

  function updateSubsection(subIndex: number, next: SitePageSubsection) {
    const list = [...subsections];
    list[subIndex] = next;
    onChange({ ...section, subsections: list });
  }

  const panelDomId = toSectionDomId(`content-${index + 1}`, section);

  return (
    <CollapsiblePanel
      id={panelDomId}
      title={section.title || `Section ${index + 1}`}
      subtitle={section.layout ?? "default"}
      defaultOpen={index === 0}
      actions={
        <div className="admin-inline-actions">
          {dragHandleProps ? (
            <DragHandle dragHandleProps={dragHandleProps} />
          ) : null}
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      }
    >
      <SectionIdField
        fieldId={`section-${index}-id`}
        value={section._id}
        onChange={(_id) => onChange({ ...section, _id })}
      />
      <div className="admin-grid-2">
        <TextField
          label="Section title"
          value={section.title}
          onChange={(title) => onChange({ ...section, title })}
        />
        <TextField
          label="Eyebrow"
          value={section.eyebrow ?? ""}
          onChange={(eyebrow) => onChange({ ...section, eyebrow })}
        />
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor={`layout-${index}`}>
          Layout
        </label>
        <select
          id={`layout-${index}`}
          className="admin-input"
          value={section.layout ?? "default"}
          onChange={(event) =>
            onChange({
              ...section,
              layout: event.target.value as SitePageSection["layout"],
            })
          }
        >
          {LAYOUTS.map((layout) => (
            <option key={layout} value={layout}>
              {layout}
            </option>
          ))}
        </select>
      </div>
      <TextField
        label="Body"
        value={section.body ?? ""}
        onChange={(body) => onChange({ ...section, body })}
        multiline
        rows={6}
      />
      <ImageField
        label="Primary image"
        value={section.image ?? ""}
        onChange={(image) => onChange({ ...section, image })}
      />
      <StringListField
        label="Gallery image URLs"
        items={section.images ?? []}
        onChange={(images) => onChange({ ...section, images })}
        addLabel="Add image URL"
        placeholder="https://… or use upload on hero"
      />
      <StringListField
        label="Bullet / list items"
        items={section.items ?? []}
        onChange={(items) => onChange({ ...section, items })}
        addLabel="Add item"
      />

      <div className="admin-subsection-stack">
        <div className="admin-field-header">
          <span className="admin-label">Subsections</span>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              addKey();
              onChange({
                ...section,
                subsections: [
                  ...subsections,
                  { title: "New subsection", body: "", items: [] },
                ],
              });
            }}
          >
            Add subsection
          </button>
        </div>
        {subsections.map((sub, subIndex) => (
          <SubsectionEditor
            key={keys[subIndex]}
            subsection={sub}
            index={subIndex}
            onChange={(next) => updateSubsection(subIndex, next)}
            onRemove={() => {
              removeKey(subIndex);
              onChange({
                ...section,
                subsections: subsections.filter((_, i) => i !== subIndex),
              });
            }}
          />
        ))}
      </div>
    </CollapsiblePanel>
  );
}
