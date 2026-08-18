import type { IconProps } from "./types";
import { iconSize } from "./types";

/**
 * External link icon for admin row actions.
 *
 * @param props - Icon size and SVG attributes
 */
export default function ExternalLink({
  size = 16,
  className = "",
  strokeWidth = 2,
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
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
