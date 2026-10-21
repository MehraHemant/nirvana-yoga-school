import type { ImageProps } from "next/image";
import Image from "@/components/ui/CdnImage";

type HeroMediaImageProps = Omit<ImageProps, "fill">;

/**
 * Full-bleed Next Image layer for image-based hero variants.
 *
 * @param props - Next Image properties; the image always fills its hero frame.
 */
export function HeroMediaImage({ className, ...props }: HeroMediaImageProps) {
  return <Image {...props} fill className={className} />;
}
