"use client";

import { type ImageOrientation, imageOrientation } from "@/lib/cdn/image-frame";

export type MediaShapeFilter = "all" | ImageOrientation;

const SHAPE_OPTIONS: ReadonlyArray<readonly [MediaShapeFilter, string]> = [
  ["all", "All shapes"],
  ["portrait", "Portrait"],
  ["landscape", "Landscape"],
  ["square", "Square"],
];

type MediaShapeFilterChipsProps = {
  value: MediaShapeFilter;
  onChange: (value: MediaShapeFilter) => void;
};

/**
 * Chip row filtering a media picker by portrait, landscape, or square.
 *
 * @param props - Active filter and change handler
 */
export function MediaShapeFilterChips({
  value,
  onChange,
}: MediaShapeFilterChipsProps) {
  return (
    <div className="admin-chip-row admin-media-picker-shape">
      {SHAPE_OPTIONS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={`admin-chip ${value === key ? "admin-chip--active" : ""}`}
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Maps the chip value to the `orientation` query param (`all` → no filter).
 *
 * @param value - Active shape filter
 */
export function mediaShapeQuery(
  value: MediaShapeFilter,
): ImageOrientation | undefined {
  return value === "all" ? undefined : value;
}

/**
 * Whether stored pixels match the shape chip.
 * Missing or invalid dimensions match only "all".
 *
 * @param width - Stored width in pixels
 * @param height - Stored height in pixels
 * @param shape - Active shape filter
 */
export function matchesMediaShape(
  width: number | null | undefined,
  height: number | null | undefined,
  shape: MediaShapeFilter,
): boolean {
  if (shape === "all") return true;
  if (width == null || height == null) return false;
  return imageOrientation(width, height) === shape;
}
