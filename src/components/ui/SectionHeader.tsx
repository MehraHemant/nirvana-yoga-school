import type { ReactNode } from "react";
import Heading from "./Heading";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center" | "end";
  invert?: boolean;
  /** Overrides default muted/white description color */
  descriptionClassName?: string;
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  invert = false,
  descriptionClassName,
  className = "",
}: Props) {
  const alignment =
    align === "center"
      ? "text-center mx-auto"
      : align === "end"
        ? "text-right ml-auto"
        : "text-left";
  const eyebrowColor = invert ? "text-accent" : "text-primary";
  const descColor = invert ? "text-white/75" : "text-ink";

  return (
    <div className={`${alignment} ${className}`}>
      {eyebrow && (
        <div
          className={`type-eyebrow ${eyebrowColor} mb-3 sm:mb-4`}
        >
          {eyebrow}
        </div>
      )}
      <Heading
        as="h2"
        align={align}
        invert={invert}
        size="h2"
      >
        {title}
      </Heading>
      {description && (
        <p
          className={`type-lead mt-4 sm:mt-5 ${descriptionClassName ?? descColor}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
