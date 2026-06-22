import type { HTMLAttributes, ReactNode } from "react";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingAlign = "left" | "center" | "end";
export type HeadingFont = "serif" | "sans" | "poppins" | "noe";
export type HeadingSize = "h1" | "h2" | "h3" | "h4" | "display-sm" | "none";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  align?: HeadingAlign;
  font?: HeadingFont;
  size?: HeadingSize;
  invert?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Heading({
  as: Tag = "h2",
  align = "left",
  font = "serif",
  size,
  invert = false,
  className = "",
  children,
  ...props
}: HeadingProps) {
  // Map align to text alignment classes
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    end: "text-right",
  };

  const fontClasses: Record<HeadingFont, string> = {
    serif: "font-serif",
    // type-h* / type-display-sm bake in serif — !important lets font prop win
    sans: "!font-sans",
    poppins: "!font-poppins",
    noe: "!font-noe",
  };

  // Determine size
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
      className={`${fontClasses[font]} ${sizeClasses[defaultSize]} ${alignClasses[align]} ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
