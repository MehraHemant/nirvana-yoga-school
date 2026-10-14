"use client";

import type { TeachersModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { SectionIdField } from "../SectionIdField";
import { TeachersPicker } from "../TeachersPicker";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type TeachersModuleEditorProps = ModulePanelProps & {
  teachers: TeachersModule;
  onChange: (teachers: TeachersModule) => void;
};

/**
 * Page teachers band — multi-select from the shared `/teacher` faculty store.
 *
 * @param props - Teachers module and change handler
 */
export function TeachersModuleEditor({
  teachers,
  onChange,
  panelId = "module-teachers",
  step = 8,
  description,
  open,
  onOpenChange,
}: TeachersModuleEditorProps) {
  const selectedSlugs = teachers.selectedSlugs ?? [];

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Teachers"
      subtitle={`${selectedSlugs.length} selected`}
      description={
        description ??
        "Pick faculty from the Teachers data store. Profiles are edited under Teachers — not invented here."
      }
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={teachers.live}
          onChange={(live) => onChange({ ...teachers, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={teachers._id}
        onChange={(_id) => onChange({ ...teachers, _id })}
      />
      <TeachersPicker
        selectedSlugs={selectedSlugs}
        onChange={(nextSlugs) =>
          onChange({ ...teachers, selectedSlugs: nextSlugs })
        }
      />
    </CollapsiblePanel>
  );
}
