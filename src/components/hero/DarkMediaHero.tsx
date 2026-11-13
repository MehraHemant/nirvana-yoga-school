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
        quality={85}
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Reading scrim: holds dark across the text column, eases off toward the photo. */}
      <div
        className="absolute inset-0 bg-linear-to-r from-ink/80 via-ink/45 via-40% to-transparent"
        aria-hidden="true"
      />
      {/* Header scrim keeps the transparent nav legible over bright photos. */}
      <div
        className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink/55 via-ink/20 via-50% to-transparent"
        aria-hidden="true"
      />
      {children}
    </HeroFrame>
  );
}
