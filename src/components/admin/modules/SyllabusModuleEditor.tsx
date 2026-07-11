"use client";

import type { SyllabusModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import { NestedItemCard } from "../NestedItemCard";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
import type { ModulePanelProps } from "./types";

type SyllabusModuleEditorProps = ModulePanelProps & {
  syllabus: SyllabusModule;
  onChange: (syllabus: SyllabusModule) => void;
};

/**
 * Syllabus module editor.
 *
 * @param props - Syllabus config and change handler
 */
export function SyllabusModuleEditor({
  syllabus,
  onChange,
  panelId = "module-syllabus",
  step = 6,
  description,
  open,
  onOpenChange,
  hideLibraryActions = false,
}: SyllabusModuleEditorProps) {
  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Syllabus"
      subtitle={`${syllabus.chapters.length} chapters`}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="syllabus"
            payload={syllabus}
            hasContent={syllabus.chapters.length > 0}
            onInsert={(payload) => onChange(payload as SyllabusModule)}
          />
        )
      }
    >
      <TextField
        label="Intro description"
        value={syllabus.description}
        onChange={(description) => onChange({ ...syllabus, description })}
        multiline
      />
      {syllabus.chapters.map((chapter, index) => (
        <NestedItemCard
          // biome-ignore lint/suspicious/noArrayIndexKey: chapter rows lack stable ids
          key={`chapter-${index}`}
          title={chapter.title || "New chapter"}
          index={index}
          total={syllabus.chapters.length}
          onRemove={() =>
            onChange({
              ...syllabus,
              chapters: syllabus.chapters.filter((_, i) => i !== index),
            })
          }
        >
          <TextField
            label="Chapter title"
            value={chapter.title}
            onChange={(title) => {
              const chapters = [...syllabus.chapters];
              chapters[index] = { ...chapter, title };
              onChange({ ...syllabus, chapters });
            }}
          />
          <TextField
            label="Description"
            value={chapter.description}
            onChange={(description) => {
              const chapters = [...syllabus.chapters];
              chapters[index] = { ...chapter, description };
              onChange({ ...syllabus, chapters });
            }}
            multiline
          />
          <StringListField
            label="Subtopics"
            items={chapter.subtopics}
            onChange={(subtopics) => {
              const chapters = [...syllabus.chapters];
              chapters[index] = { ...chapter, subtopics };
              onChange({ ...syllabus, chapters });
            }}
            hint='Paste a full topic list with "Paste many".'
          />
        </NestedItemCard>
      ))}
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() =>
          onChange({
            ...syllabus,
            chapters: [
              ...syllabus.chapters,
              { title: "New chapter", description: "", subtopics: [] },
            ],
          })
        }
      >
        Add chapter
      </button>
    </CollapsiblePanel>
  );
}
