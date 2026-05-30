import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
};

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[92rem]",
};

export default function Container({
  children,
  className = "",
  as: Tag = "div",
  size = "xl",
}: Props) {
  return (
    <Tag className={`mx-auto w-full px-5 md:px-8 ${sizes[size]} ${className}`}>
      {children}
    </Tag>
  );
}
