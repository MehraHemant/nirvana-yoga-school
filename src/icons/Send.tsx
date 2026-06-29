import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Send({
  size = 24,
  className = "",
  ...props
}: IconProps) {
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
        d="m22 2-7 20-4-9-9-4Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2 11 13"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
