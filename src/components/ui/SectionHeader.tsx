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
    <div className={`max-w-6xl ${alignment} ${className}`}>
      {eyebrow && (
        <div
          className={`uppercase tracking-wider ${eyebrowColor} mb-3 sm:mb-4`}
        >
          {eyebrow}
        </div>
      )}
      <Heading
        as="h2"
        align={align}
        invert={invert}
        size="h2"
        className="leading-tight"
      >
        {title}
      </Heading>
      {description && (
        <p
          className={`text-base lg:text-lg leading-tight mt-4 sm:mt-5 ${descriptionClassName ?? descColor}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
