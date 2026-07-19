"use client";

import type { ScheduleModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ListRowActions } from "../ListRowActions";
import { SectionIdField } from "../SectionIdField";
import {
  reorderItems,
  SortableList,
  SortableRow,
  withSortField,
} from "../SortableList";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type ScheduleModuleEditorProps = ModulePanelProps & {
  schedule: ScheduleModule;
  onChange: (schedule: ScheduleModule) => void;
};

/**
 * Daily schedule module editor with drag-and-drop row reorder.
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
}: ScheduleModuleEditorProps) {
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    schedule.items.length,
  );

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    const items = withSortField(
      reorderItems(schedule.items, fromIndex, toIndex),
    ) as typeof schedule.items;
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
        <ModuleLiveField
          id={`${panelId}-live`}
          value={schedule.live}
          onChange={(live) => onChange({ ...schedule, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={schedule._id}
        onChange={(_id) => onChange({ ...schedule, _id })}
      />
      <TextField
        label="Description"
        value={schedule.description}
        onChange={(description) => onChange({ ...schedule, description })}
        multiline
        rows={3}
      />

      {schedule.items.length > 0 ? (
        <div className="admin-compact-table-scroll">
          <div className="admin-compact-table admin-compact-table--form admin-compact-table--schedule">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                #
              </span>
              <span className="admin-compact-col admin-compact-col--time">
                Time
              </span>
              <span className="admin-compact-col admin-compact-col--activity">
                Activity
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <span className="sr-only">Actions</span>
              </span>
            </div>
            <SortableList ids={keys} onReorder={handleReorder}>
              {schedule.items.map((item, index) => (
                <SortableRow key={keys[index]} id={keys[index]}>
                  {({ dragHandleProps }) => (
                    <div className="admin-compact-table-row">
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
                            items[index] = {
                              ...item,
                              time: event.target.value,
                            };
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
                            items[index] = {
                              ...item,
                              activity: event.target.value,
                            };
                            onChange({ ...schedule, items });
                          }}
                        />
                      </span>
                      <span className="admin-compact-col admin-compact-col--actions">
                        <ListRowActions
                          dragHandleProps={dragHandleProps}
                          onRemove={() => {
                            removeKey(index);
                            onChange({
                              ...schedule,
                              items: schedule.items.filter(
                                (_, i) => i !== index,
                              ),
                            });
                          }}
                        />
                      </span>
                    </div>
                  )}
                </SortableRow>
              ))}
            </SortableList>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="admin-btn-sm"
        onClick={() => {
          addKey();
          onChange({
            ...schedule,
            items: [...schedule.items, { time: "", activity: "" }],
          });
        }}
      >
        Add schedule row
      </button>
    </CollapsiblePanel>
  );
}
