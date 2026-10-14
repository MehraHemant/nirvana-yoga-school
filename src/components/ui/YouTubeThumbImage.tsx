"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import {
  nextYouTubeThumbnailUrl,
  youTubeThumbnailUrl,
} from "@/lib/youtube";

type YouTubeThumbImageProps = Omit<ImageProps, "src" | "onError"> & {
  /** YouTube video ID used to build the thumbnail URL when `src` is unset */
  videoId: string;
  /** Optional override (registry / CMS); defaults to maxres via {@link youTubeThumbnailUrl} */
  src?: string;
};

/**
 * Next/Image for YouTube posters. Starts at maxres and steps down
 * (maxres → sd → hq) via {@link nextYouTubeThumbnailUrl} on load error.
 *
 * @param props - videoId, optional src override, and standard Image props
 */
export default function YouTubeThumbImage({
  videoId,
  src,
  alt = "",
  ...props
}: YouTubeThumbImageProps) {
  const initial = src?.trim() || youTubeThumbnailUrl(videoId);
  const [currentSrc, setCurrentSrc] = useState(initial);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      onError={() => {
        const next = nextYouTubeThumbnailUrl(currentSrc);
        if (next) setCurrentSrc(next);
      }}
    />
  );
}
