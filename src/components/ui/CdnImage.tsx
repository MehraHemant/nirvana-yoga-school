import NextImage, { type ImageProps } from "next/image";

/**
 * Renders the real photograph immediately. No color fill and no hidden
 * frame — the file paints as soon as it decodes.
 *
 * @param props - Next/Image props
 */
export default function CdnImage(props: ImageProps) {
  return <NextImage {...props} />;
}
