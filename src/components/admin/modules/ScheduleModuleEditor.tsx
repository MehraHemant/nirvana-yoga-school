"use client";

import type { ScheduleModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ListRowActions } from "../ListRowActions";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import { TextField } from "../TextField";
import type { ModulePanelProps } from "./types";

type ScheduleModuleEditorProps = ModulePanelProps & {
  schedule: ScheduleModule;
  onChange: (schedule: ScheduleModule) => void;
};

/**
 * Daily schedule module editor.
 *
 * @param props - Schedule config and change handler
 */
export function ScheduleModuleEditor({
  schedule,
  onChange,
  panelId = "module-schedule",
  step = 7,
  description,
  open,
  onOpenChange,
  hideLibraryActions = false,
}: ScheduleModuleEditorProps) {
  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= schedule.items.length) return;
    const items = [...schedule.items];
    [items[index], items[target]] = [items[target], items[index]];
    onChange({ ...schedule, items });
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Daily schedule"
      subtitle={`${schedule.items.length} rows`}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="schedule"
            payload={schedule}
            hasContent={schedule.items.length > 0}
            onInsert={(payload) => onChange(payload as ScheduleModule)}
          />
        )
      }
    >
      <TextField
        label="Description"
        value={schedule.description}
        onChange={(description) => onChange({ ...schedule, description })}
        multiline
        rows={3}
      />

      {schedule.items.length > 0 ? (
        <div className="admin-compact-table admin-compact-table--form admin-compact-table--schedule">
          <div className="admin-compact-table-head admin-compact-table-row">
            <span className="admin-compact-col admin-compact-col--num">#</span>
            <span className="admin-compact-col admin-compact-col--time">
              Time
            </span>
            <span className="admin-compact-col admin-compact-col--activity">
              Activity
            </span>
            <span className="admin-compact-col admin-compact-col--actions" />
          </div>
          {schedule.items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: schedule rows lack stable ids
            <div key={`schedule-${index}`} className="admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                {index + 1}
              </span>
              <span className="admin-compact-col admin-compact-col--time">
                <input
                  className="admin-input admin-input--compact"
                  value={item.time}
                  placeholder="6:00 AM"
                  onChange={(event) => {
                    const items = [...schedule.items];
                    items[index] = { ...item, time: event.target.value };
                    onChange({ ...schedule, items });
                  }}
                />
              </span>
              <span className="admin-compact-col admin-compact-col--activity">
                <input
                  className="admin-input admin-input--compact"
                  value={item.activity}
                  placeholder="Morning yoga practice"
                  onChange={(event) => {
                    const items = [...schedule.items];
                    items[index] = { ...item, activity: event.target.value };
                    onChange({ ...schedule, items });
                  }}
                />
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <ListRowActions
                  index={index}
                  total={schedule.items.length}
                  onMoveUp={() => moveItem(index, -1)}
                  onMoveDown={() => moveItem(index, 1)}
                  onRemove={() =>
                    onChange({
                      ...schedule,
                      items: schedule.items.filter((_, i) => i !== index),
                    })
                  }
                />
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="admin-btn-sm"
        onClick={() =>
          onChange({
            ...schedule,
            items: [...schedule.items, { time: "", activity: "" }],
          })
        }
      >
        Add schedule row
      </button>
    </CollapsiblePanel>
  );
}
