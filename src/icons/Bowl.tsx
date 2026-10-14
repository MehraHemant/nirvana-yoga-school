import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Bowl({
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
        d="M4 11h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8Z M8 21h8 M10 3c-.6 1 .6 2 0 3 M14 3c-.6 1 .6 2 0 3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
