import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Flame({
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
        d="M12 3c-1.5 2.5-4 4.5-4 8a4 4 0 108 0c0-3.5-2.5-5.5-4-8z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11c-.8 1.2-2 2-2 3.5a2 2 0 004 0c0-1.5-1.2-2.3-2-3.5z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
