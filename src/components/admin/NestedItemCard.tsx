"use client";

type NestedItemCardProps = {
  title: string;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
};

/**
 * Reusable card wrapper for list items with reorder and remove actions.
 *
 * @param props - Item metadata, actions, and field children
 */
export function NestedItemCard({
  title,
  index,
  total: _total,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: NestedItemCardProps) {
  return (
    <div className="admin-nested-card">
      <div className="admin-nested-card-header">
        <span className="admin-nested-card-title">
          <span className="admin-nested-card-num">{index + 1}</span>
          {title}
        </span>
        <div className="admin-nested-card-actions">
          {onMoveUp ? (
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={onMoveUp}
              aria-label="Move up"
            >
              ↑
            </button>
          ) : null}
          {onMoveDown ? (
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={onMoveDown}
              aria-label="Move down"
            >
              ↓
            </button>
          ) : null}
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--danger"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
