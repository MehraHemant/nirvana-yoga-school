import type { HTMLAttributes, ReactNode } from "react";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingAlign = "left" | "center" | "end";
export type HeadingSize = "h1" | "h2" | "h3" | "h4" | "display-sm" | "none";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  align?: HeadingAlign;
  size?: HeadingSize;
  invert?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Semantic heading with shared type scale — inherits Poppins from global defaults.
 *
 * @param props - Heading element props and typography options
 */
export default function Heading({
  as: Tag = "h2",
  align = "left",
  size,
  invert = false,
  className = "",
  children,
  ...props
}: HeadingProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    end: "text-right",
  };

  const defaultSize =
    size || (Tag === "h5" || Tag === "h6" ? "display-sm" : Tag);

  const sizeClasses = {
    h1: "type-h1",
    h2: "type-h2",
    h3: "type-h3",
    h4: "type-h4",
    "display-sm": "type-display-sm",
    none: "",
  };

  const colorClass = invert ? "text-white" : "text-ink";

  return (
    <Tag
      className={`${sizeClasses[defaultSize]} ${alignClasses[align]} ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
