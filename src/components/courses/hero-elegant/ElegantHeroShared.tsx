"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { MediaLightbox, YouTubeThumbImage } from "@/components/ui";
import { cmsImageCursorClass } from "@/content/types/cms-image";
import { ChevronLeft, ChevronRight, Play } from "@/icons";
import {
  type CourseHeroProps,
  MaximizeIcon,
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
  for (let offset = 1; offset < photos.length && side.length < count; offset++) {
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

  return (
    <div className={`relative overflow-hidden rounded-xl bg-neutral-100 ${className}`}>
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
          <Image
            key={g.activePhoto.url}
            src={g.photoSrc(g.activePhoto)}
            alt={g.activeAlt}
            fill
            priority
            loading="eager"
            fetchPriority="high"
            sizes={sizes}
            className={imageClassName}
          />
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
          {g.activeClickAction === "fullscreen" ? (
            <button
              type="button"
              onClick={() => g.activatePhoto(g.photoIdx)}
              className="absolute top-3 right-3 z-20 bg-white p-2.5 text-secondary shadow-sm transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Open image fullscreen"
            >
              <MaximizeIcon />
            </button>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 bg-linear-to-t from-black/55 to-transparent px-3 pt-14 pb-3 text-white">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => g.stepPhoto(-1)}
                className="bg-white/95 p-2 text-secondary hover:bg-white focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Previous photo"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => g.stepPhoto(1)}
                className="bg-white/95 p-2 text-secondary hover:bg-white focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Next photo"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <span className="text-[10px] tabular-nums tracking-[0.14em]">
              {String(g.photoIdx + 1).padStart(2, "0")} /{" "}
              {String(g.photos.length).padStart(2, "0")}
            </span>
          </div>
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
}: {
  gallery: ElegantGallery;
  className?: string;
  itemClassName?: string;
}) {
  const g = gallery;
  // Border color must live only in selected/idle — putting `border-transparent`
  // on the shared base leaves both utilities on the active thumb, and without
  // tailwind-merge the transparent rule often wins in generated CSS order.
  const base =
    "relative shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  const selected = "border-primary";
  const idle = "border-transparent hover:border-secondary/20";

  return (
    <div className={`no-scrollbar flex min-w-0 justify-start overflow-x-auto ${className}`}>
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
              sizes="160px"
              className="object-cover"
            />
          </button>
        );
      })}
      {g.videoIds.map((id, index) => {
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

/** Renders the gallery lightbox owned by `useHeroGallery`. */
export function ElegantLightbox({ gallery }: { gallery: ElegantGallery }) {
  return <MediaLightbox {...gallery.lightboxProps} />;
}
