"use client";

import Image from "@/components/ui/CdnImage";
import { useEffect } from "react";
import { HeroFrame } from "@/components/hero";
import { Container } from "@/components/ui";
import { useHeroGallery } from "../hero-variants/shared";
import {
  ELEGANT_HERO_FRAME,
  type ElegantHeroProps,
  ElegantLightbox,
  HeroSideVideo,
  HeroStage,
  MediaRail,
  pickSidePhotos,
} from "./ElegantHeroShared";
import {
  HERO_IMAGE_QUALITY,
  HERO_STAGE_SIZES,
  heroStageImageProps,
} from "./hero-image";

/** `sizes` for the supporting side photos. */
const SIDE_PHOTO_SIZES = "(max-width: 768px) 33vw, 400px";

/**
 * Gallery Feature — one dominant image, three supporting photos, and a film row.
 *
 * @param props - Real course hero content
 */
export default function CourseHeroGalleryFeature(props: ElegantHeroProps) {
  const gallery = useHeroGallery(props);
  const cornerVideoId = gallery.videoIds[0];
  const sideCount = cornerVideoId ? 2 : 3;
  const sidePhotos = pickSidePhotos(
    gallery.photos,
    gallery.photoIdx,
    sideCount,
  );

  // Autoplay shifts the side column by one photo; warm the one that enters
  // next so the last tile paints from cache instead of loading grey.
  const { photos, photoIdx } = gallery;
  useEffect(() => {
    if (photos.length <= sideCount + 1) return;
    const incoming = photos[(photoIdx + sideCount + 1) % photos.length];
    if (!incoming?.url) return;
    const props = heroStageImageProps(incoming.url, SIDE_PHOTO_SIZES);
    const img = new window.Image();
    img.decoding = "async";
    if (props.sizes) img.sizes = props.sizes;
    if (props.srcSet) img.srcset = props.srcSet;
    img.src = props.src;
  }, [photos, photoIdx, sideCount]);
  const showSideColumn = Boolean(cornerVideoId) || sidePhotos.length > 0;
  const railItemCount =
    gallery.photos.length +
    gallery.videoIds.filter((id) => id !== cornerVideoId).length;

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
              showSideColumn
                ? "md:grid-cols-[minmax(0,3fr)_minmax(9rem,1fr)]"
                : ""
            }`}
          >
            <HeroStage
              gallery={gallery}
              sizes={HERO_STAGE_SIZES}
              className="aspect-16/10 h-full min-h-48 w-full md:aspect-auto"
            />
            {showSideColumn ? (
              <div className="grid min-h-0 grid-cols-3 gap-2 md:grid-cols-1 md:grid-rows-3">
                {cornerVideoId ? (
                  <HeroSideVideo
                    videoId={cornerVideoId}
                    index={0}
                    className="aspect-16/10 min-h-0 md:aspect-auto"
                  />
                ) : null}
                {sidePhotos.map(({ photo, index }) => (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => gallery.showPhoto(index)}
                    className="relative aspect-16/10 min-h-0 overflow-hidden rounded-xl bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:aspect-auto"
                    aria-label={`Show photo ${index + 1}`}
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      // Above the fold — lazy loading only delays these tiles.
                      loading="eager"
                      fetchPriority="low"
                      quality={HERO_IMAGE_QUALITY}
                      sizes={SIDE_PHOTO_SIZES}
                      className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {railItemCount > 1 ? (
            <div className="mt-3 grid min-w-0 shrink-0 gap-2 border-t border-secondary/15 pt-3 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
              <MediaRail
                gallery={gallery}
                excludeVideoIds={cornerVideoId ? [cornerVideoId] : []}
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
