"use client";

import { Trash } from "@/icons";
import { DragHandle, type DragHandleProps } from "./SortableList";

type ListRowActionsProps = {
  onRemove: () => void;
  /** When set, shows a grab handle instead of move up/down */
  dragHandleProps?: DragHandleProps;
};

/**
 * Compact drag-handle + remove controls for one-line list rows.
 *
 * @param props - Remove handler and optional drag handle props
 */
export function ListRowActions({
  onRemove,
  dragHandleProps,
}: ListRowActionsProps) {
  return (
    <div className="admin-list-row-actions admin-list-row-actions--compact">
      {dragHandleProps ? <DragHandle dragHandleProps={dragHandleProps} /> : null}
      <button
        type="button"
        className="admin-icon-btn admin-icon-btn--sm admin-icon-btn--danger"
        aria-label="Remove"
        title="Remove"
        onClick={onRemove}
      >
        <Trash size={14} />
      </button>
    </div>
  );
}
