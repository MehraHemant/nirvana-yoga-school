import type { IconProps } from "./types";
import { iconSize } from "./types";

/**
 * Door-and-arrow outline for signing out.
 *
 * @param props - Icon size and SVG attributes
 */
export default function LogOut({
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
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
