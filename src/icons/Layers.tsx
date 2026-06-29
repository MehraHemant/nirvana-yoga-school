import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Layers({
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
        d="m12.83 2.18 8.53 4.94a1 1 0 0 1 0 1.73l-8.53 4.94a2 2 0 0 1-2 0L2.3 8.85a1 1 0 0 1 0-1.73L10.83 2.2a2 2 0 0 1 2 0z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12a1 1 0 0 0 .58.91l8.6 4.91a2 2 0 0 0 1.99 0l8.6-4.91A1 1 0 0 0 22 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17a1 1 0 0 0 .58.91l8.6 4.91a2 2 0 0 0 1.99 0l8.6-4.91A1 1 0 0 0 22 17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
