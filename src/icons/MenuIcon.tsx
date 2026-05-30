import type { IconProps } from "./types";
import { iconSize } from "./types";

type Props = IconProps & {
  open?: boolean;
};

export default function MenuIcon({
  open = false,
  size = 24,
  className = "",
  ...props
}: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`${open ? "menu-icon--open" : ""} ${className}`.trim()}
      {...iconSize(size, props)}
      {...props}
    >
      <path
        className="menu-icon-line menu-icon-line-top"
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        className="menu-icon-line menu-icon-line-mid"
        d="M4 12h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        className="menu-icon-line menu-icon-line-bot"
        d="M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
