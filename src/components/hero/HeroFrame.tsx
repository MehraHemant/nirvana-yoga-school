import type { ComponentPropsWithoutRef } from "react";

type HeroFrameProps = ComponentPropsWithoutRef<"section"> & {
  /** Marks a hero that requires the site's transparent header treatment. */
  transparentHeader?: boolean;
};

/**
 * Structural shell for public hero variants.
 *
 * Variants: home-video (`/`), dark-media (`/contact`, `/enquire-now`, booking,
 * and CMS simple banners), landing-media (YTT hub and online courses),
 * editorial-split (CMS page-minimal), course-bento, and retreat-split.
 *
 * @param props - Section attributes and optional transparent-header marker.
 */
export function HeroFrame({
  transparentHeader = false,
  ...props
}: HeroFrameProps) {
  return (
    <section
      {...props}
      data-transparent-header={transparentHeader ? "true" : undefined}
    />
  );
}
