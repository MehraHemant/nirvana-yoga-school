"use client";

import Image from "next/image";
import { HeroFrame } from "@/components/hero";
import { Container } from "@/components/ui";
import {
  HERO_IMAGE_QUALITY,
  useHeroGallery,
} from "../hero-variants/shared";
import {
  ELEGANT_HERO_FRAME,
  type ElegantHeroProps,
  ElegantLightbox,
  HeroStage,
  MediaRail,
  pickSidePhotos,
} from "./ElegantHeroShared";

/**
 * Gallery Feature — one dominant image, three supporting photos, and a film row.
 *
 * @param props - Real course hero content
 */
export default function CourseHeroGalleryFeature(props: ElegantHeroProps) {
  const gallery = useHeroGallery(props);
  const sidePhotos = pickSidePhotos(gallery.photos, gallery.photoIdx, 3);

  return (
    <HeroFrame className={`${ELEGANT_HERO_FRAME} bg-white text-secondary`}>
      <Container
        size="2xl"
        className="flex min-h-0 flex-1 flex-col py-4 md:py-5"
      >
        <header className="mb-3 shrink-0">
          <h1 className="w-full text-center text-2xl leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-3xl lg:text-[2.55rem]">
            {props.title}
          </h1>
        </header>

        <div
          className="flex min-h-0 flex-1 flex-col"
          onPointerDown={() => gallery.setInteracting(true)}
          onPointerUp={() => gallery.setInteracting(false)}
          onPointerCancel={() => gallery.setInteracting(false)}
          onPointerLeave={() => gallery.setInteracting(false)}
        >
          <div
            className={`grid min-h-0 flex-1 gap-2 md:items-stretch ${
              sidePhotos.length > 0
                ? "md:grid-cols-[minmax(0,3fr)_minmax(9rem,1fr)]"
                : ""
            }`}
          >
            <HeroStage
              gallery={gallery}
              sizes="(max-width: 768px) 100vw, min(75vw, 1100px)"
              className="aspect-16/10 h-full min-h-48 w-full md:aspect-auto"
            />
            {sidePhotos.length > 0 ? (
              <div className="grid min-h-0 grid-cols-3 gap-2 md:grid-cols-1 md:grid-rows-3">
                {sidePhotos.map(({ photo, index }) => (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => gallery.showPhoto(index)}
                    className="relative aspect-16/10 min-h-0 overflow-hidden rounded-xl bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:aspect-auto"
                    aria-label={`Show photo ${index + 1}`}
                  >
                    <Image
                      src={gallery.sideSrc(photo)}
                      alt=""
                      fill
                      loading="lazy"
                      quality={HERO_IMAGE_QUALITY}
                      sizes="(max-width: 768px) 33vw, 400px"
                      className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {gallery.mediaCount > 1 ? (
            <div className="mt-3 grid min-w-0 shrink-0 gap-2 border-t border-secondary/15 pt-3 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
              <MediaRail
                gallery={gallery}
                className="min-w-0 w-full gap-2"
                itemClassName="h-14 aspect-[16/10]"
              />
            </div>
          ) : null}
        </div>
      </Container>
      <ElegantLightbox gallery={gallery} />
    </HeroFrame>
  );
}
