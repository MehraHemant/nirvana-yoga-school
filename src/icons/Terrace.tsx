import type { IconProps } from "./types";
import { iconSize } from "./types";

export default function Terrace({
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
        d="M4 18h16M6 18V10h12v8M8 10V7h8v3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14h4M12 5a2 2 0 100-4 2 2 0 000 4z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
