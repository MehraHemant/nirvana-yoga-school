import type { IconProps } from "./types";
import { iconSize } from "./types";

/**
 * Eye-off icon for password visibility toggles.
 *
 * @param props - Icon size and SVG attributes
 */
export default function EyeOff({
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
        d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a18.45 18.45 0 0 1-2.16 3.19M6.61 6.61A18.45 18.45 0 0 0 2 12s3 7 10 7a10.43 10.43 0 0 0 5.08-1.27"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 2l20 20"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
