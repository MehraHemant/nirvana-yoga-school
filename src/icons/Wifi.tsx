import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Wifi({
  size = 18,
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
        d="M8.284 16.284a3 3 0 004.242 0M5.456 13.456a7 7 0 009.9 0M2.628 10.628a11 11 0 0015.544 0M12 19h.008v.008H12V19z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
