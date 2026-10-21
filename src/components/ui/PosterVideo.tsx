"use client";

import { forwardRef, useState } from "react";
import CdnImage from "@/components/ui/CdnImage";
import {
  cloudinaryVideoPlaybackUrl,
  cloudinaryVideoPosterUrl,
} from "@/lib/cdn/cloudinary-video-url";
import { PHOTO_IMAGE_QUALITY } from "@/lib/cdn/responsive-image";

type PosterVideoProps = {
  /** Playback URL. Cloudinary uploads are upgraded to a sharp 1080p profile. */
  src: string;
  /** Poster image. Cloudinary videos fall back to a sharp first frame. */
  poster?: string;
  /** Classes for the video element, including object-fit and position */
  className?: string;
  /** Classes for the poster image */
  posterClassName?: string;
  /** CSS sizes for the poster */
  sizes?: string;
  /** Skip the image optimizer (Instagram and other unsigned hosts) */
  unoptimized?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  /** Buffer only this mounted clip. Off-screen videos should not mount this. */
  preload?: "none" | "metadata" | "auto";
  "aria-label"?: string;
};

/**
 * Plays one on-screen video over its poster. The poster stays on top until
 * `playing`, so the visitor never sees an empty video element. The poster
 * then fades out and the high-quality file is what remains.
 *
 * @param props - Source, poster, and media attributes
 * @param ref - The underlying video element, for play/pause from a parent
 */
const PosterVideo = forwardRef<HTMLVideoElement, PosterVideoProps>(
  function PosterVideo(
    {
      src,
      poster,
      className = "absolute inset-0 h-full w-full object-cover",
      posterClassName = "object-cover",
      sizes = "(max-width: 1024px) 100vw, 70vw",
      unoptimized = false,
      autoPlay = false,
      muted = false,
      loop = false,
      controls = false,
      playsInline = true,
      preload = "auto",
      "aria-label": ariaLabel,
    },
    ref,
  ) {
    const [painted, setPainted] = useState(false);
    const playback = cloudinaryVideoPlaybackUrl(src);
    const posterSrc = poster?.trim() || cloudinaryVideoPosterUrl(src) || "";

    return (
      <>
        <video
          ref={ref}
          src={playback}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline={playsInline}
          preload={preload}
          aria-label={ariaLabel}
          onPlaying={() => setPainted(true)}
          className={className}
        />
        {posterSrc ? (
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-500 motion-reduce:transition-none ${painted ? "opacity-0" : "opacity-100"}`}
          >
            <CdnImage
              src={posterSrc}
              alt=""
              fill
              sizes={sizes}
              quality={PHOTO_IMAGE_QUALITY}
              unoptimized={unoptimized}
              className={posterClassName}
            />
          </span>
        ) : null}
      </>
    );
  },
);

export default PosterVideo;
