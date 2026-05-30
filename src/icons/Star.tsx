import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Star({
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
      <path d="M12 2l2.9 6.9L22 9.7l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.5L2 9.7l7.1-.8L12 2z" />
    </svg>
  );
}
