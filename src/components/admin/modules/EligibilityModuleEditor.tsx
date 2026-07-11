"use client";

import type { EligibilityModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import { NestedItemCard } from "../NestedItemCard";
import { TextField } from "../TextField";
import type { ModulePanelProps } from "./types";

type EligibilityModuleEditorProps = ModulePanelProps & {
  eligibility: EligibilityModule;
  onChange: (eligibility: EligibilityModule) => void;
};

/**
 * Admission standards / eligibility module editor.
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
  hideLibraryActions = false,
}: EligibilityModuleEditorProps) {
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
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="eligibility"
            payload={eligibility}
            hasContent={eligibility.requirements.length > 0}
            onInsert={(payload) => onChange(payload as EligibilityModule)}
          />
        )
      }
    >
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
      {eligibility.requirements.map((req, index) => (
        <NestedItemCard
          key={`req-${req.num}-${index}`}
          title={req.title || "Requirement"}
          index={index}
          total={eligibility.requirements.length}
          onRemove={() =>
            onChange({
              ...eligibility,
              requirements: eligibility.requirements.filter(
                (_, i) => i !== index,
              ),
            })
          }
          onMoveUp={
            index > 0
              ? () => {
                  const requirements = [...eligibility.requirements];
                  [requirements[index - 1], requirements[index]] = [
                    requirements[index],
                    requirements[index - 1],
                  ];
                  onChange({ ...eligibility, requirements });
                }
              : undefined
          }
          onMoveDown={
            index < eligibility.requirements.length - 1
              ? () => {
                  const requirements = [...eligibility.requirements];
                  [requirements[index], requirements[index + 1]] = [
                    requirements[index + 1],
                    requirements[index],
                  ];
                  onChange({ ...eligibility, requirements });
                }
              : undefined
          }
        >
          <div className="admin-grid-2">
            <TextField
              label="Number"
              value={req.num}
              onChange={(num) => {
                const requirements = [...eligibility.requirements];
                requirements[index] = { ...req, num };
                onChange({ ...eligibility, requirements });
              }}
            />
            <TextField
              label="Title"
              value={req.title}
              onChange={(title) => {
                const requirements = [...eligibility.requirements];
                requirements[index] = { ...req, title };
                onChange({ ...eligibility, requirements });
              }}
            />
          </div>
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
      ))}
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() =>
          onChange({
            ...eligibility,
            requirements: [
              ...eligibility.requirements,
              { num: "0", title: "", desc: "" },
            ],
          })
        }
      >
        Add requirement
      </button>
    </CollapsiblePanel>
  );
}
