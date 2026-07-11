"use client";

type ListRowActionsProps = {
  index: number;
  total: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
};

/**
 * Compact reorder and remove controls for one-line list rows.
 *
 * @param props - Row index, total count, and action handlers
 */
export function ListRowActions({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ListRowActionsProps) {
  return (
    <div className="admin-list-row-actions admin-list-row-actions--compact">
      <button
        type="button"
        className="admin-btn-xs"
        aria-label="Move up"
        onClick={onMoveUp}
        disabled={index === 0}
      >
        ↑
      </button>
      <button
        type="button"
        className="admin-btn-xs"
        aria-label="Move down"
        onClick={onMoveDown}
        disabled={index === total - 1}
      >
        ↓
      </button>
      <button
        type="button"
        className="admin-btn-xs admin-btn-xs--danger"
        aria-label="Remove"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}
