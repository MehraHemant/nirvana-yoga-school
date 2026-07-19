"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { GripVertical } from "@/icons";

/**
 * Moves an item from one index to another.
 *
 * @param items - Source list
 * @param fromIndex - Drag source index
 * @param toIndex - Drop target index
 * @returns Reordered copy
 */
export function reorderItems<T>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }
  return arrayMove(items, fromIndex, toIndex);
}

/**
 * Stamps a `sort` field (0, 10, 20…) on object list items after reorder.
 *
 * @param items - Object rows to annotate
 * @returns Items with updated `sort` values
 */
export function withSortField<T extends object>(
  items: T[],
): Array<T & { sort: number }> {
  return items.map((item, index) => ({ ...item, sort: index * 10 }));
}

type SortableListProps = {
  /** Stable ids aligned with the rendered children */
  ids: string[];
  /** Called with from/to indexes when a drag completes */
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: ReactNode;
  /** Extra class on the list wrapper */
  className?: string;
  /** `grid` uses rect sorting for thumbnail boards; default is vertical list */
  layout?: "list" | "grid";
};

/**
 * Drag-and-drop list/grid context for admin reorderable rows/cards.
 *
 * @param props - Item ids, reorder handler, and sortable children
 */
export function SortableList({
  ids,
  onReorder,
  children,
  className,
  layout = "list",
}: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = ids.indexOf(String(active.id));
    const toIndex = ids.indexOf(String(over.id));
    if (fromIndex < 0 || toIndex < 0) return;
    onReorder(fromIndex, toIndex);
  }

  const strategy =
    layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={strategy}>
        {className ? <div className={className}>{children}</div> : children}
      </SortableContext>
    </DndContext>
  );
}

export type DragHandleProps = HTMLAttributes<HTMLButtonElement>;

type SortableRowRenderArgs = {
  dragHandleProps: DragHandleProps;
  isDragging: boolean;
};

type SortableRowProps = {
  id: string;
  className?: string;
  style?: CSSProperties;
  children: (args: SortableRowRenderArgs) => ReactNode;
};

/**
 * One sortable row/card. Pass `dragHandleProps` to {@link DragHandle}.
 *
 * @param props - Stable id, optional class/style, and render prop
 */
export function SortableRow({
  id,
  className,
  style,
  children,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const mergedStyle: CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.88 : style?.opacity,
    position: isDragging ? "relative" : style?.position,
    zIndex: isDragging ? 2 : style?.zIndex,
  };

  return (
    <div ref={setNodeRef} className={className} style={mergedStyle}>
      {children({
        dragHandleProps: { ...attributes, ...listeners },
        isDragging,
      })}
    </div>
  );
}

type DragHandleButtonProps = {
  /** Props from {@link SortableRow} render args */
  dragHandleProps: DragHandleProps;
  className?: string;
};

/**
 * Grab handle button for sortable admin rows.
 *
 * @param props - dnd-kit listeners/attributes and optional className
 */
export function DragHandle({
  dragHandleProps,
  className = "",
}: DragHandleButtonProps) {
  return (
    <button
      type="button"
      className={`admin-icon-btn admin-icon-btn--sm admin-drag-handle ${className}`.trim()}
      aria-label="Drag to reorder"
      title="Drag to reorder"
      {...dragHandleProps}
    >
      <GripVertical size={14} />
    </button>
  );
}
