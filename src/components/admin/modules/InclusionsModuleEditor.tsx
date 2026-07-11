"use client";

import type { InclusionsModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
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
  hideLibraryActions = false,
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
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="inclusions"
            payload={inclusions}
            hasContent={inclusions.items.length > 0}
            onInsert={(payload) => onChange(payload as InclusionsModule)}
          />
        )
      }
    >
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
      <StringListField
        label="Exclusions"
        items={inclusions.exclusions ?? []}
        onChange={(exclusions) => onChange({ ...inclusions, exclusions })}
        addLabel="Add exclusion"
        hint="Items not covered in the program fee."
      />
    </CollapsiblePanel>
  );
}
