import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function BadgeStar({
  size = 20,
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
        d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.8L12 16.6 6.4 20.6l2.1-6.8L3 9.8h6.8L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
