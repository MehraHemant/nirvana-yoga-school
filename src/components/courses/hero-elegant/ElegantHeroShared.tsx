"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { MediaLightbox, YouTubeThumbImage } from "@/components/ui";
import { cmsImageCursorClass } from "@/content/types/cms-image";
import { Play } from "@/icons";
import {
  type CourseHeroProps,
  HERO_IMAGE_QUALITY,
  useHeldHeroSrc,
  type useHeroGallery,
  ytThumb,
  ytTitle,
} from "../hero-variants/shared";

export type ElegantGallery = ReturnType<typeof useHeroGallery>;
export type ElegantHeroProps = CourseHeroProps;

export const ELEGANT_HERO_FRAME =
  "relative flex min-h-svh w-full min-w-0 flex-col overflow-hidden pt-(--site-header-height)";

/**
 * Picks up to `count` photos after the active index, wrapping and skipping the lead.
 *
 * @param photos - Full photo list from the gallery
 * @param photoIdx - Currently active photo index
 * @param count - Maximum side photos to return (default 3)
 */
export function pickSidePhotos<T>(
  photos: T[],
  photoIdx: number,
  count = 3,
): { photo: T; index: number }[] {
  if (photos.length <= 1) return [];
  const side: { photo: T; index: number }[] = [];
  for (
    let offset = 1;
    offset < photos.length && side.length < count;
    offset++
  ) {
    const index = (photoIdx + offset) % photos.length;
    const photo = photos[index];
    if (photo === undefined) continue;
    side.push({ photo, index });
  }
  return side;
}

/**
 * Displays available course facts in a restrained definition list.
 *
 * @param props - Course hero values and optional layout classes
 */
export function HeroFacts({
  duration,
  certification,
  fee,
  className = "",
  itemClassName = "",
}: Pick<CourseHeroProps, "duration" | "certification" | "fee"> & {
  className?: string;
  itemClassName?: string;
}) {
  const items = [
    duration ? { label: "Duration", value: duration } : null,
    certification ? { label: "Certification", value: certification } : null,
    fee ? { label: "Fee", value: fee } : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  return (
    <dl className={className}>
      {items.map((item) => (
        <div key={item.label} className={itemClassName}>
          <dt className="type-eyebrow text-[9px] tracking-[0.16em] text-current/55">
            {item.label}
          </dt>
          <dd className="text-xs font-medium leading-snug text-current">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Shared photo/YouTube canvas. The containing variant controls its ratio,
 * framing, and position so the ten compositions remain structurally distinct.
 *
 * @param props - Gallery state, sizing hint, and optional stage adornment
 */
export function HeroStage({
  gallery,
  sizes,
  className = "",
  imageClassName = "object-cover",
  children,
}: {
  gallery: ElegantGallery;
  sizes: string;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
}) {
  const g = gallery;
  const targetSrc = g.activePhoto ? g.photoSrc(g.activePhoto) : undefined;
  const { readySrc, incomingSrc, onIncomingLoad } = useHeldHeroSrc(targetSrc);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-neutral-100 ${className}`}
    >
      {g.activeVideoId ? (
        <>
          <iframe
            key={g.activeVideoId}
            src={`https://www.youtube.com/embed/${g.activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title={ytTitle(g.activeVideoId, 0)}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0 bg-black"
          />
          <button
            type="button"
            onClick={g.clearVideo}
            className="absolute top-3 left-3 z-20 bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-secondary uppercase shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back to photos
          </button>
        </>
      ) : g.activePhoto ? (
        <>
          {readySrc ? (
            <Image
              key={readySrc}
              src={readySrc}
              alt={g.activeAlt}
              fill
              priority
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              quality={HERO_IMAGE_QUALITY}
              sizes={sizes}
              unoptimized
              className={imageClassName}
            />
          ) : null}
          {incomingSrc ? (
            <Image
              key={incomingSrc}
              src={incomingSrc}
              alt=""
              fill
              priority
              loading="eager"
              fetchPriority="high"
              quality={HERO_IMAGE_QUALITY}
              sizes={sizes}
              unoptimized
              onLoad={onIncomingLoad}
              className={`${imageClassName} opacity-0`}
              aria-hidden
            />
          ) : null}
          {g.activeClickAction !== "none" ? (
            <button
              type="button"
              onClick={() => g.activatePhoto(g.photoIdx)}
              className={`absolute inset-0 z-10 ${cmsImageCursorClass(g.activeClickAction)} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white`}
              aria-label={
                g.activeClickAction === "redirect"
                  ? `Open link for ${g.activeAlt}`
                  : `View photo ${g.photoIdx + 1} fullscreen`
              }
            />
          ) : null}
        </>
      ) : null}
      {children}
    </div>
  );
}

/**
 * Shows every photo and video in a horizontally scrollable media rail.
 *
 * @param props - Gallery state and visual sizing classes
 */
export function MediaRail({
  gallery,
  className = "",
  itemClassName = "h-12 aspect-video",
  excludeVideoIds = [],
}: {
  gallery: ElegantGallery;
  className?: string;
  itemClassName?: string;
  /** Video ids already shown elsewhere in the hero (e.g. corner slot). */
  excludeVideoIds?: string[];
}) {
  const g = gallery;
  const excludedVideoIds = new Set(excludeVideoIds);
  // Border color must live only in selected/idle — putting `border-transparent`
  // on the shared base leaves both utilities on the active thumb, and without
  // tailwind-merge the transparent rule often wins in generated CSS order.
  const base =
    "relative shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  const selected = "border-primary";
  const idle = "border-transparent hover:border-secondary/20";

  return (
    <div
      className={`no-scrollbar flex min-w-0 justify-start overflow-x-auto ${className}`}
    >
      {g.photos.map((photo, index) => {
        const isActive = !g.activeVideoId && g.photoIdx === index;
        return (
          <button
            key={photo.url}
            type="button"
            onClick={() => g.showPhoto(index)}
            className={`${base} ${itemClassName} ${isActive ? selected : idle}`}
            aria-label={`Show photo ${index + 1}`}
            aria-current={isActive}
          >
            <Image
              src={g.thumbSrc(photo)}
              alt=""
              fill
              loading="lazy"
              quality={HERO_IMAGE_QUALITY}
              sizes="180px"
              className="object-cover"
            />
          </button>
        );
      })}
      {g.videoIds
        .filter((id) => !excludedVideoIds.has(id))
        .map((id, index) => {
          const isActive = g.activeVideoId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => g.playVideo(id)}
              className={`${base} ${itemClassName} ${isActive ? selected : idle}`}
              aria-label={`Play ${ytTitle(id, index)}`}
              aria-current={isActive}
            >
              <YouTubeThumbImage
                videoId={id}
                src={ytThumb(id)}
                alt=""
                fill
                loading="lazy"
                sizes="160px"
                className="object-cover"
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-secondary shadow-sm">
                  <Play size={10} className="ml-px fill-current" />
                </span>
              </span>
            </button>
          );
        })}
    </div>
  );
}

/**
 * Pinned corner video — thumbnail until play, then inline YouTube embed.
 *
 * @param props - Video id, positional index, and layout classes
 */
export function HeroSideVideo({
  videoId,
  index,
  className = "",
}: {
  videoId: string;
  index: number;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-neutral-900 ${className}`}
    >
      {playing ? (
        <iframe
          key={videoId}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={ytTitle(videoId, index)}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`Play ${ytTitle(videoId, index)}`}
        >
          <YouTubeThumbImage
            videoId={videoId}
            src={ytThumb(videoId)}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 768px) 33vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-secondary/15 transition-colors group-hover:bg-secondary/25" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-secondary shadow-md transition-transform group-hover:scale-110">
              <Play size={14} className="ml-0.5 fill-current" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/** Renders the gallery lightbox owned by `useHeroGallery`. */
export function ElegantLightbox({ gallery }: { gallery: ElegantGallery }) {
  return <MediaLightbox {...gallery.lightboxProps} />;
}
