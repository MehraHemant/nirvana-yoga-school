import type { IconProps } from "./types";

export default function HeroFlourish({ className = "", ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      {...props}
    >
      <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="0.5" />
      <path
        d="M60 20 C72 40, 88 48, 100 60 C88 72, 72 80, 60 100 C48 80, 32 72, 20 60 C32 48, 48 40, 60 20Z"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <path
        d="M60 35 L60 85 M35 60 L85 60"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  );
}
