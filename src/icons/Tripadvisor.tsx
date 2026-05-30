import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Tripadvisor({
  size = 14,
  className = "",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#34E0A1"
      aria-hidden="true"
      className={className}
      {...iconSize(size, props)}
      {...props}
    >
      <circle cx="12" cy="12" r="11" />
    </svg>
  );
}
