"use client";

import dynamic from "next/dynamic";
import { HeroFrame, HeroMediaImage } from "@/components/hero";
import { Container } from "@/components/ui";
import VenueGallery from "@/components/venue/VenueGallery";
import {
  createEmptyGalleryModule,
  resolveGallerySections,
} from "@/content/mappers/gallery-module";
import { normalizeVenueHero } from "@/content/mappers/venue-hero";
import { normalizeVideosModule } from "@/content/mappers/videos-module";
import type { GalleryModule } from "@/content/types/page-modules";
import type { SitePageGalleryImage } from "@/content/types/site-page";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import type { PlaylistVideo } from "@/lib/playlist-video";
import { SiteFaq } from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

/**
 * Lightweight placeholder so layout doesn’t jump while a section chunk loads.
 *
 * @param props - Optional min-height utility class
 */
function SectionSkeleton({
  minHeight = "min-h-[40vh]",
}: {
  minHeight?: string;
}) {
  return <div className={`w-full ${minHeight}`} aria-hidden="true" />;
}

const MapSection = dynamic(() => import("@/components/home/MapSection"), {
  loading: () => <SectionSkeleton minHeight="min-h-[50vh]" />,
});

type VenueClientProps = SiteClientProps & {
  /** Pre-fetched playlist for `page_modules.videos` (YouTube and/or Cloudinary) */
  videos?: PlaylistVideo[];
};

/**
 * Resolves the gallery image list from DB-backed sources.
 * Prefers `page_gallery_images` (mapped.gallery), then modules.gallery.images.
 *
 * @param mappedGallery - Images from `page_gallery_images`
 * @param moduleGallery - Gallery module from `page_modules`
 */
function resolveVenueImages(
  mappedGallery: SitePageGalleryImage[],
  moduleGallery: GalleryModule | null | undefined,
): SitePageGalleryImage[] {
  if (mappedGallery.length > 0) return mappedGallery;
  return moduleGallery?.images ?? [];
}

/**
 * Gallery-first venue page — course venue and retreat venue.
 * Image hero with a light darkening wash, copy below, then videos/gallery/map/FAQ.
 *
 * @param props - Mapped venue content, page modules, and optional videos
 */
export default function VenueClient({
  page,
  mapped,
  modules,
  siteMap,
  videos = [],
}: VenueClientProps) {
  const moduleGallery = modules?.gallery;
  const images = resolveVenueImages(mapped.gallery ?? [], moduleGallery);

  const gallery: GalleryModule = {
    ...createEmptyGalleryModule(),
    ...moduleGallery,
    images,
    sectionOrder: moduleGallery?.sectionOrder?.length
      ? moduleGallery.sectionOrder
      : resolveGallerySections(images).map(({ id, label, description }) => ({
          id,
          label,
          description,
        })),
  };

  const hero = normalizeVenueHero(
    modules?.hero,
    page.image || images[0]?.url || "",
  );

  const title = hero.title || gallery.title || page.title;
  const subtitle = hero.subtitle || gallery.description || page.description;
  const eyebrow = hero.eyebrow || gallery.eyebrow || page.eyebrow || "Venue";
  const heroImage = hero.backgroundImage || page.image || images[0]?.url || "";

  const showMap =
    (modules?.flags.showMap ?? mapped.showMap ?? true) &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));

  const videosModule = normalizeVideosModule(modules?.videos);
  const showVideos = shouldRenderSection(videosModule, videos.length > 0);

  const photoMeta =
    images.length > 0 ? (
      <p className="mt-4 text-sm text-ink/65">
        {images.length} photos
        {gallery.sectionOrder && gallery.sectionOrder.length > 0
          ? ` · ${gallery.sectionOrder.length} collections`
          : ""}
      </p>
    ) : null;

  return (
    <>
      {heroImage ? (
        <>
          <HeroFrame
            id={hero._id || "hero"}
            transparentHeader
            className="relative min-h-[52svh] overflow-hidden bg-ink lg:min-h-[58svh]"
          >
            <HeroMediaImage
              src={heroImage}
              alt={`${String(title)} — Nirvana Yoga School`}
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
            <div
              className="relative min-h-[52svh] lg:min-h-[58svh]"
              aria-hidden="true"
            />
          </HeroFrame>
          <header className="border-b border-ink/8 bg-white pb-10 pt-8 sm:pb-12">
            <Container size="2xl">
              <p className="type-eyebrow text-primary">{eyebrow}</p>
              <h1 className="type-h1 mt-2 max-w-3xl text-ink">{title}</h1>
              {subtitle ? (
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink sm:text-lg">
                  {subtitle}
                </p>
              ) : null}
              {photoMeta}
            </Container>
          </header>
        </>
      ) : (
        <header className="border-b border-ink/8 bg-white pt-28 pb-10 sm:pt-32 sm:pb-12">
          <Container size="2xl">
            <p className="type-eyebrow text-primary">{eyebrow}</p>
            <h1 className="type-h1 mt-2 max-w-3xl text-ink">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink sm:text-lg">
                {subtitle}
              </p>
            ) : null}
          </Container>
        </header>
      )}

      <article className="min-h-screen max-w-full overflow-x-clip bg-white">
        <VenueGallery
          gallery={gallery}
          images={images}
          lightboxTitle={String(title)}
          playlistVideos={showVideos ? videos : []}
          videosHeader={{
            title: videosModule.title || "Videos",
            description: videosModule.description,
          }}
        />
        {showMap && siteMap ? (
          <MapSection className="bg-white" content={siteMap} />
        ) : null}
        <SiteFaq mapped={mapped} modules={modules} />
      </article>
    </>
  );
}
