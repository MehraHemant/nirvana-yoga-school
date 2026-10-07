import type { IconProps } from "./types";
import { iconSize } from "./types";

/**
 * Sliders outline for account settings.
 *
 * @param props - Icon size and SVG attributes
 */
export default function Settings({
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
        d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
