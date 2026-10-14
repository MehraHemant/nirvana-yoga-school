import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  invert?: boolean;
  className?: string;
};

export default function Pill({
  children,
  invert = false,
  className = "",
}: Props) {
  const styles = invert
    ? "bg-white/10 border-white/30 text-white backdrop-blur-sm"
    : "bg-primary/10 border-primary/30 text-primary";

  return (
    <div
      className={`type-eyebrow inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2 ${styles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 shrink-0 rounded-full animate-pulse ${invert ? "bg-white" : "bg-primary"}`}
        aria-hidden="true"
      />
      <span className={invert ? "text-white" : undefined}>{children}</span>
    </div>
  );
}
