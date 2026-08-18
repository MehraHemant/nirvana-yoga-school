"use client";

import { useState } from "react";
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
  /** Optional header-right controls (e.g. Live toggle) before remove */
  headerActions?: React.ReactNode;
  /** Optional secondary line under the title */
  subtitle?: string;
  /** When true, body is hidden until the header is expanded */
  collapsible?: boolean;
  /** Initial open state when `collapsible` (default false) */
  defaultOpen?: boolean;
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
  headerActions,
  subtitle,
  collapsible = false,
  defaultOpen = false,
  children,
}: NestedItemCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const expanded = !collapsible || open;

  return (
    <article
      className={`admin-nested-card${collapsible ? " admin-nested-card--collapsible" : ""}${expanded ? " admin-nested-card--open" : " admin-nested-card--collapsed"}`}
    >
      <header className="admin-nested-card-header">
        {collapsible ? (
          <button
            type="button"
            className="admin-nested-card-toggle"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={expanded}
          >
            <span className="admin-nested-card-chevron" aria-hidden="true">
              {expanded ? "▾" : "▸"}
            </span>
            <span className="admin-nested-card-title">
              {dragHandleProps ? (
                <DragHandle dragHandleProps={dragHandleProps} />
              ) : null}
              <span className="admin-nested-card-num">{index + 1}</span>
              <span className="admin-nested-card-heading">
                <span className="admin-nested-card-label">{title}</span>
                {subtitle ? (
                  <span className="admin-nested-card-subtitle">{subtitle}</span>
                ) : null}
              </span>
            </span>
          </button>
        ) : (
          <span className="admin-nested-card-title">
            {dragHandleProps ? (
              <DragHandle dragHandleProps={dragHandleProps} />
            ) : null}
            <span className="admin-nested-card-num">{index + 1}</span>
            <span className="admin-nested-card-heading">
              <span className="admin-nested-card-label">{title}</span>
              {subtitle ? (
                <span className="admin-nested-card-subtitle">{subtitle}</span>
              ) : null}
            </span>
          </span>
        )}
        <div className="admin-list-row-actions admin-list-row-actions--compact">
          {headerActions}
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
      {expanded ? (
        <div className="admin-nested-card-body">{children}</div>
      ) : null}
    </article>
  );
}
