import type { IconProps } from "./types";

export default function HeroUnderline({ className = "", ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 280 14"
      preserveAspectRatio="none"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M2 9 Q 60 1, 140 6 T 278 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="hero-underline opacity-90"
      />
    </svg>
  );
}
