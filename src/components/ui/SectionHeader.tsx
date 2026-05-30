import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  invert = false,
  className = "",
}: Props) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  const eyebrowColor = invert ? "text-accent" : "text-primary";
  const titleColor = invert ? "text-white" : "text-ink";
  const descColor = invert ? "text-white/75" : "text-muted";

  return (
    <div className={`max-w-3xl ${alignment} ${className}`}>
      {eyebrow && (
        <div className={`type-eyebrow ${eyebrowColor} mb-4`}>{eyebrow}</div>
      )}
      <h2
        className={`font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.1] ${titleColor}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`type-lead mt-5 ${descColor}`}>{description}</p>
      )}
    </div>
  );
}
