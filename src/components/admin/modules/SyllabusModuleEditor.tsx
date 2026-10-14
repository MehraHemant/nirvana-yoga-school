"use client";

import type { SyllabusModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { NestedItemCard } from "../NestedItemCard";
import { SectionIdField } from "../SectionIdField";
import {
  reorderItems,
  SortableList,
  SortableRow,
  withSortField,
} from "../SortableList";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type SyllabusModuleEditorProps = ModulePanelProps & {
  syllabus: SyllabusModule;
  onChange: (syllabus: SyllabusModule) => void;
};

/**
 * Syllabus module editor with drag-and-drop chapter reorder.
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
}: SyllabusModuleEditorProps) {
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    syllabus.chapters.length,
  );

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    const chapters = withSortField(
      reorderItems(syllabus.chapters, fromIndex, toIndex),
    ) as typeof syllabus.chapters;
    onChange({ ...syllabus, chapters });
  }

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
        <ModuleLiveField
          id={`${panelId}-live`}
          value={syllabus.live}
          onChange={(live) => onChange({ ...syllabus, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={syllabus._id}
        onChange={(_id) => onChange({ ...syllabus, _id })}
      />
      <TextField
        label="Intro description"
        value={syllabus.description}
        onChange={(description) => onChange({ ...syllabus, description })}
        multiline
      />
      <SortableList ids={keys} onReorder={handleReorder}>
        {syllabus.chapters.map((chapter, index) => (
          <SortableRow key={keys[index]} id={keys[index]}>
            {({ dragHandleProps }) => (
              <NestedItemCard
                title={chapter.title || "New chapter"}
                index={index}
                total={syllabus.chapters.length}
                dragHandleProps={dragHandleProps}
                onRemove={() => {
                  removeKey(index);
                  onChange({
                    ...syllabus,
                    chapters: syllabus.chapters.filter((_, i) => i !== index),
                  });
                }}
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
            )}
          </SortableRow>
        ))}
      </SortableList>
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() => {
          addKey();
          onChange({
            ...syllabus,
            chapters: [
              ...syllabus.chapters,
              { title: "New chapter", description: "", subtopics: [] },
            ],
          });
        }}
      >
        Add chapter
      </button>
    </CollapsiblePanel>
  );
}
