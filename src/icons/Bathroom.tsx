import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Bathroom({
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
        d="M5 12h14a2 2 0 012 2v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12V8a2 2 0 012-2h1M16 12V8a2 2 0 00-2-2h-1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
