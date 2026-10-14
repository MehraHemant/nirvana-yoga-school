import type { IconProps } from "./types";
import { iconSize } from "./types";

/**
 * Receipt outline for bookings and purchases.
 *
 * @param props - Icon size and SVG attributes
 */
export default function Receipt({
  size = 18,
  className = "",
  strokeWidth = 1.75,
  ...props
}: IconProps & { strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...iconSize(size, props)}
      {...props}
    >
      <path
        d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3ZM9 8h6M9 12h6M9 16h3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
