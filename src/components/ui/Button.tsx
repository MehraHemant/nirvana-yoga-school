import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline-light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-primary/20 hover:bg-primary-dark hover:shadow-lg",
  secondary: "bg-ink text-white hover:bg-ink/90",
  ghost:
    "bg-transparent text-ink border border-transparent hover:border-ink/10 hover:bg-ink/5",
  "outline-light":
    "border border-white/40 bg-white/12 text-white shadow-sm backdrop-blur-sm hover:border-white hover:bg-white hover:text-ink hover:shadow-md",
};

const responsiveSize =
  "px-5 py-2.5 text-sm sm:px-6 sm:py-3 md:px-8 md:py-4 md:text-base";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  responsive?: boolean;
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

/**
 * Brand CTA as a link or button. `outline-light` fills white on hover so it
 * matches the solid primary hover feel on dark surfaces.
 *
 * @param props - Variant, size, optional href, and button/link attrs
 */
export default function Button(props: LinkProps | ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    responsive = false,
    className = "",
    children,
    ...rest
  } = props;

  const classes = `${base} ${variants[variant]} ${responsive ? responsiveSize : sizes[size]} ${className}`;

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
