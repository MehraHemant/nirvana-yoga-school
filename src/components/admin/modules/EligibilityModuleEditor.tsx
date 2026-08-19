"use client";

import type {
  EligibilityModule,
  EligibilityRequirement,
} from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { NestedItemCard } from "../NestedItemCard";
import { SectionIdField } from "../SectionIdField";
import { reorderItems, SortableList, SortableRow } from "../SortableList";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type EligibilityModuleEditorProps = ModulePanelProps & {
  eligibility: EligibilityModule;
  onChange: (eligibility: EligibilityModule) => void;
};

/**
 * Stamps `sort` (0, 10, 20…) and syncs `num` (0, 1, 2…) from list order.
 *
 * @param requirements - Admission requirement rows
 * @returns Requirements with aligned sort and num fields
 */
function withEligibilitySort(
  requirements: EligibilityRequirement[],
): EligibilityRequirement[] {
  return requirements.map((req, index) => ({
    ...req,
    sort: index * 10,
    num: String(index),
  }));
}

/**
 * Resolves the 0-based step label from `sort` or list position.
 *
 * @param sort - Stored sort value (0, 10, 20…)
 * @param fallbackIndex - Array index when sort is missing
 */
function stepIndexFromSort(
  sort: number | undefined,
  fallbackIndex: number,
): number {
  return typeof sort === "number" ? sort / 10 : fallbackIndex;
}

/**
 * Admission standards / eligibility module editor with drag reorder.
 *
 * @param props - Eligibility config and change handler
 */
export function EligibilityModuleEditor({
  eligibility,
  onChange,
  panelId = "module-eligibility",
  step = 5,
  description,
  open,
  onOpenChange,
}: EligibilityModuleEditorProps) {
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    eligibility.requirements.length,
  );

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    const requirements = withEligibilitySort(
      reorderItems(eligibility.requirements, fromIndex, toIndex),
    );
    onChange({ ...eligibility, requirements });
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Admission standards"
      subtitle={`${eligibility.requirements.length} requirements`}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={eligibility.live}
          onChange={(live) => onChange({ ...eligibility, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={eligibility._id}
        onChange={(_id) => onChange({ ...eligibility, _id })}
      />
      <TextField
        label="Eyebrow"
        value={eligibility.eyebrow ?? ""}
        onChange={(eyebrow) => onChange({ ...eligibility, eyebrow })}
      />
      <TextField
        label="Title"
        value={eligibility.title ?? ""}
        onChange={(title) => onChange({ ...eligibility, title })}
      />
      <TextField
        label="Description"
        value={eligibility.description ?? ""}
        onChange={(description) => onChange({ ...eligibility, description })}
        multiline
      />
      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={eligibility.showAllianceBadge ?? true}
          onChange={(e) =>
            onChange({ ...eligibility, showAllianceBadge: e.target.checked })
          }
        />
        Show Yoga Alliance badge
      </label>
      <SortableList ids={keys} onReorder={handleReorder}>
        {eligibility.requirements.map((req, index) => (
          <SortableRow key={keys[index]} id={keys[index]}>
            {({ dragHandleProps }) => (
              <NestedItemCard
                title={req.title || "Requirement"}
                index={stepIndexFromSort(req.sort, index)}
                zeroBased
                total={eligibility.requirements.length}
                dragHandleProps={dragHandleProps}
                onRemove={() => {
                  removeKey(index);
                  onChange({
                    ...eligibility,
                    requirements: withEligibilitySort(
                      eligibility.requirements.filter((_, i) => i !== index),
                    ),
                  });
                }}
              >
                <TextField
                  label="Title"
                  value={req.title}
                  onChange={(title) => {
                    const requirements = [...eligibility.requirements];
                    requirements[index] = { ...req, title };
                    onChange({ ...eligibility, requirements });
                  }}
                />
                <TextField
                  label="Description"
                  value={req.desc}
                  onChange={(desc) => {
                    const requirements = [...eligibility.requirements];
                    requirements[index] = { ...req, desc };
                    onChange({ ...eligibility, requirements });
                  }}
                  multiline
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
            ...eligibility,
            requirements: withEligibilitySort([
              ...eligibility.requirements,
              { num: "0", title: "", desc: "" },
            ]),
          });
        }}
      >
        Add requirement
      </button>
    </CollapsiblePanel>
  );
}
