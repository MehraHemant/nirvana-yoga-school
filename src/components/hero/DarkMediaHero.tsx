import type { ReactNode } from "react";
import { HeroFrame } from "./HeroFrame";
import { HeroMediaImage } from "./HeroMediaImage";

type DarkMediaHeroProps = {
  /** Optional CMS section identifier. */
  id?: string;
  /** CMS image source for the full-bleed background. */
  image: string;
  /** Accessible image description; decorative images should use an empty string. */
  imageAlt: string;
  /** Foreground hero content. */
  children: ReactNode;
};

/**
 * Full-bleed dark image hero for form and CMS banner pages.
 *
 * Used by contact, enquiry, booking, and the CMS `simple-banner` renderer.
 *
 * @param props - CMS media, section id, and composed foreground content.
 */
export function DarkMediaHero({
  id,
  image,
  imageAlt,
  children,
}: DarkMediaHeroProps) {
  return (
    <HeroFrame
      id={id}
      transparentHeader
      className="relative min-h-[52svh] overflow-hidden bg-ink text-white lg:min-h-[58svh]"
    >
      <HeroMediaImage
        src={image}
        alt={imageAlt}
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/65 to-ink/25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-ink/75 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px]"
        aria-hidden="true"
      />
      {children}
    </HeroFrame>
  );
}
