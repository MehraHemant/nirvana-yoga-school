import type { IconProps } from "./types";
import { iconSize } from "./types";

/**
 * Upward chevron for reorder controls and disclosures.
 *
 * @param props - Optional size and className
 */
export default function ChevronUp({
  size = 16,
  className = "",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...iconSize(size, props)}
      {...props}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}
