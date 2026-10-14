import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Bookmark({
  size = 24,
  className = "",
  fill = "none",
  ...props
}: IconProps & { fill?: "none" | "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill}
      aria-hidden="true"
      className={className}
      {...iconSize(size, props)}
      {...props}
    >
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth={fill === "currentColor" ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
