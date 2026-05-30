import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline-light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark hover:shadow-lg shadow-primary/20",
  secondary: "bg-ink text-white hover:bg-ink/90",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  "outline-light":
    "bg-white/10 text-white backdrop-blur-sm border border-white/30 hover:bg-white/20",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type LinkProps = CommonProps & {
  href: string;
} & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "className" | "href" | "children"
  >;

type ButtonProps = CommonProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export default function Button(props: LinkProps | ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...rest
  } = props;

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
}
