import type { IconProps } from "./types";
import { iconSize } from "./types";

/**
 * Vertical grip dots for drag-to-reorder handles.
 *
 * @param props - Icon size and SVG attributes
 */
export default function GripVertical({
  size = 16,
  className = "",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...iconSize(size, props)}
      {...props}
    >
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}
