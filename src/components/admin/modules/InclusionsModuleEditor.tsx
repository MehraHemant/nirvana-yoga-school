"use client";

import type { InclusionsModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { SectionIdField } from "../SectionIdField";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type InclusionsModuleEditorProps = ModulePanelProps & {
  inclusions: InclusionsModule;
  onChange: (inclusions: InclusionsModule) => void;
};

/**
 * What is included module editor.
 *
 * @param props - Inclusions config and change handler
 */
export function InclusionsModuleEditor({
  inclusions,
  onChange,
  panelId = "module-inclusions",
  step = 4,
  description,
  open,
  onOpenChange,
}: InclusionsModuleEditorProps) {
  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="What is included"
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={inclusions.live}
          onChange={(live) => onChange({ ...inclusions, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={inclusions._id}
        onChange={(_id) => onChange({ ...inclusions, _id })}
      />
      <TextField
        label="Eyebrow"
        value={inclusions.eyebrow ?? ""}
        onChange={(eyebrow) => onChange({ ...inclusions, eyebrow })}
      />
      <TextField
        label="Title"
        value={inclusions.title ?? ""}
        onChange={(title) => onChange({ ...inclusions, title })}
      />
      <TextField
        label="Description"
        value={inclusions.description ?? ""}
        onChange={(description) => onChange({ ...inclusions, description })}
        multiline
      />
      <StringListField
        label="Inclusions"
        items={inclusions.items}
        onChange={(items) => onChange({ ...inclusions, items })}
        addLabel="Add inclusion"
        hint='Use "Paste many" to add a whole list at once.'
      />
      <div className="admin-field-group">
        <p className="admin-field-group-label">Arrival support (optional)</p>
        <p className="admin-hint admin-field-group-hint">
          Shown as a tip box under the section description. Leave body empty to
          hide on the public page.
        </p>
        <TextField
          label="Title"
          value={inclusions.arrivalSupport?.title ?? ""}
          onChange={(title) =>
            onChange({
              ...inclusions,
              arrivalSupport: {
                title,
                body: inclusions.arrivalSupport?.body ?? "",
              },
            })
          }
          placeholder="Arrival Support"
        />
        <TextField
          label="Body"
          value={inclusions.arrivalSupport?.body ?? ""}
          onChange={(body) =>
            onChange({
              ...inclusions,
              arrivalSupport: {
                title: inclusions.arrivalSupport?.title ?? "",
                body,
              },
            })
          }
          multiline
          rows={4}
          placeholder="We organize airport transfers…"
        />
      </div>
    </CollapsiblePanel>
  );
}
