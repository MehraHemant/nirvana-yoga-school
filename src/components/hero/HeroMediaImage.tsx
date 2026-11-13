import type { ImageProps } from "next/image";
import Image from "@/components/ui/CdnImage";

type HeroMediaImageProps = Omit<ImageProps, "fill">;

/**
 * Full-bleed Next Image layer for image-based hero variants.
 *
 * Renders nothing when the CMS image is empty, so the hero falls back to its
 * dark background instead of emitting an `<img src="">` (which re-requests the
 * page and makes `next/image` throw).
 *
 * @param props - Next Image properties; the image always fills its hero frame.
 */
export function HeroMediaImage({
  className,
  src,
  ...props
}: HeroMediaImageProps) {
  if (typeof src === "string" && !src.trim()) return null;
  return <Image {...props} src={src} fill className={className} />;
}
