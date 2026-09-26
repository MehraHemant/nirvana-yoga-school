"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MediaLightbox } from "@/components/ui";
import {
  cmsImageAlt,
  cmsImageCursorClass,
  handleCmsImageClick,
  type ImageClickAction,
} from "@/content/types/cms-image";

type OverviewImage = {
  url: string;
  alt?: string;
  clickAction?: ImageClickAction;
  redirectUrl?: string;
};

/**
 * Overview image carousel when a course has no playlist videos.
 *
 * @param props.images - Normalized CMS images
 * @param props.className - Extra frame classes
 */
export default function OverviewImagePanel({
  images,
  className = "relative aspect-[21/9] min-h-[220px] w-full overflow-hidden rounded-3xl border border-ink/5 bg-ink/10 shadow-card sm:min-h-[280px]",
}: {
  images: OverviewImage[];
  className?: string;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (images.length > 0) setActiveImageIndex(0);
  }, [images.length]);

  if (images.length === 0) return null;

  const active = images[activeImageIndex] ?? images[0];
  const action: ImageClickAction = active.clickAction ?? "fullscreen";
  const alt = cmsImageAlt(active, "Course overview image");

  return (
    <div className={className}>
      <button
        type="button"
        disabled={action === "none"}
        onClick={() =>
          handleCmsImageClick(active, () => setLightboxOpen(true))
        }
        className={`absolute inset-0 h-full w-full ${cmsImageCursorClass(action)} disabled:cursor-default`}
        aria-label={
          action === "none"
            ? alt
            : action === "redirect"
              ? `Open link for ${alt}`
              : `View ${alt} fullscreen`
        }
      >
        <Image
          src={active.url}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
        />
      </button>
      {images.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
          {images.map((img, index) => (
            <button
              key={`${img.url}-${index}`}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              aria-label={`Show image ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === activeImageIndex ? "w-6 bg-white" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      ) : null}
      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={images.map((img) => ({ type: "image" as const, url: img.url }))}
        activeIndex={activeImageIndex}
        onChangeActiveIndex={setActiveImageIndex}
        title="Overview gallery"
      />
    </div>
  );
}
