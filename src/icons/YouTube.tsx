import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function YouTube({
  size = 16,
  className = "",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...iconSize(size, props)}
      {...props}
    >
      <path d="M23.5 6.5a3 3 0 00-2.1-2.13C19.55 4 12 4 12 4s-7.55 0-9.4.37A3 3 0 00.5 6.5C.13 8.35.13 12 .13 12s0 3.65.37 5.5a3 3 0 002.1 2.13C4.45 20 12 20 12 20s7.55 0 9.4-.37a3 3 0 002.1-2.13c.37-1.85.37-5.5.37-5.5s0-3.65-.37-5.5zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  );
}
