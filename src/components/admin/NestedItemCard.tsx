"use client";

import { Trash } from "@/icons";
import { DragHandle, type DragHandleProps } from "./SortableList";

type NestedItemCardProps = {
  title: string;
  index: number;
  /** @deprecated Kept for call-site compatibility; unused with drag reorder */
  total?: number;
  onRemove: () => void;
  /** When set, shows a grab handle for drag-and-drop reorder */
  dragHandleProps?: DragHandleProps;
  children: React.ReactNode;
};

/**
 * Card wrapper for nested list items with drag reorder and remove actions.
 *
 * @param props - Item metadata, actions, and field children
 */
export function NestedItemCard({
  title,
  index,
  onRemove,
  dragHandleProps,
  children,
}: NestedItemCardProps) {
  return (
    <article className="admin-nested-card">
      <header className="admin-nested-card-header">
        <span className="admin-nested-card-title">
          {dragHandleProps ? (
            <DragHandle dragHandleProps={dragHandleProps} />
          ) : null}
          <span className="admin-nested-card-num">{index + 1}</span>
          <span className="admin-nested-card-label">{title}</span>
        </span>
        <div className="admin-list-row-actions admin-list-row-actions--compact">
          <button
            type="button"
            className="admin-icon-btn admin-icon-btn--sm admin-icon-btn--danger"
            onClick={onRemove}
            aria-label="Remove"
            title="Remove"
          >
            <Trash size={14} />
          </button>
        </div>
      </header>
      <div className="admin-nested-card-body">{children}</div>
    </article>
  );
}
