import type { IconProps } from "./types";
import { iconSize } from "./types";

/**
 * Single person outline for account controls.
 *
 * @param props - Icon size and SVG attributes
 */
export default function User({
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
        d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
