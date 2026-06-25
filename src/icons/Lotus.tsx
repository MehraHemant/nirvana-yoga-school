import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Lotus({
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
        d="M12 12c-1.6 0-2.8-2.2-2.8-4.5C9.2 5.5 10.4 3.5 12 3.5s2.8 2 2.8 4C14.8 9.8 13.6 12 12 12Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12c-1.1-1.4-3.4-2-5.3-.8-1.2.8-1.8 2.2-1.7 3.6 1.9 1 4.6.5 7-2.8Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12c1.1-1.4 3.4-2 5.3-.8 1.2.8 1.8 2.2 1.7 3.6-1.9 1-4.6.5-7-2.8Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 12.2C3.6 12.7 3 13.6 3 14.6 3 17 7 19 12 19s9-2 9-4.4c0-1-.6-1.9-1.5-2.4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
