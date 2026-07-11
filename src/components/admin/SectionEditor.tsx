"use client";

import type { SitePageSection, SitePageSubsection } from "@/content/types";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ImageField } from "./ImageField";
import { StringListField } from "./StringListField";
import { SubsectionEditor } from "./SubsectionEditor";
import { TextField } from "./TextField";

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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
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
  onMoveUp,
  onMoveDown,
}: SectionEditorProps) {
  const subsections = section.subsections ?? [];

  function updateSubsection(subIndex: number, next: SitePageSubsection) {
    const list = [...subsections];
    list[subIndex] = next;
    onChange({ ...section, subsections: list });
  }

  return (
    <CollapsiblePanel
      title={section.title || `Section ${index + 1}`}
      subtitle={section.layout ?? "default"}
      defaultOpen={index === 0}
      actions={
        <div className="admin-inline-actions">
          {onMoveUp ? (
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={onMoveUp}
            >
              ↑
            </button>
          ) : null}
          {onMoveDown ? (
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={onMoveDown}
            >
              ↓
            </button>
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
            onClick={() =>
              onChange({
                ...section,
                subsections: [
                  ...subsections,
                  { title: "New subsection", body: "", items: [] },
                ],
              })
            }
          >
            Add subsection
          </button>
        </div>
        {subsections.map((sub, subIndex) => (
          <SubsectionEditor
            key={`${section.title}-sub-${subIndex}`}
            subsection={sub}
            index={subIndex}
            onChange={(next) => updateSubsection(subIndex, next)}
            onRemove={() =>
              onChange({
                ...section,
                subsections: subsections.filter((_, i) => i !== subIndex),
              })
            }
          />
        ))}
      </div>
    </CollapsiblePanel>
  );
}
