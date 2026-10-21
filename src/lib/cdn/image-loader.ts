import type { ImageLoaderProps } from "next/image";
import {
  cloudinaryImageLoader,
  isResizableCloudinaryImage,
} from "./cloudinary-thumb-url";

/**
 * Site-wide `next/image` loader (`images.loaderFile`). Images resize on their
 * own CDN instead of being re-encoded by the Vercel image optimizer:
 *
 * - Cloudinary uploads → `c_limit,w_,f_avif,q_auto:best` (thumbs: `q_auto:good`)
 * - Unsplash → its `w` / `q` / `auto=format` params
 * - ImageKit → `f-auto`, `c-at_max`, and a width cap
 * - Local files and already-transformed URLs are served as-is. A custom loader
 *   disables `/_next/image`, so those files are not run through Vercel as well.
 *
 * @param props - Loader props from `next/image`
 */
export default function imageLoader(props: ImageLoaderProps): string {
  const { src, width, quality } = props;
  if (isResizableCloudinaryImage(src)) return cloudinaryImageLoader(props);

  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    const q = Math.max(quality ?? 75, width >= 640 ? 80 : 75);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(q));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  }

  if (src.startsWith("https://ik.imagekit.io/")) {
    const url = new URL(src);
    const q = width >= 640 || (quality != null && quality >= 85) ? 90 : 80;
    url.searchParams.set("tr", `w-${width},c-at_max,f-auto,q-${q}`);
    return url.toString();
  }

  return src;
}
