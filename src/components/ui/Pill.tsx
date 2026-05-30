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
      className={`inline-flex items-center gap-2 border text-xs font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded-full w-fit ${styles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
          invert ? "bg-accent" : "bg-primary"
        }`}
      />
      {children}
    </div>
  );
}
