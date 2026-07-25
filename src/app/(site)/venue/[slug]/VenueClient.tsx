"use client";

import { DarkMediaHero } from "@/components/hero";
import { MapSection } from "@/components/home";
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
 * Dark media hero, CMS videos above the photo gallery, map, and FAQ.
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
    sectionOrder:
      moduleGallery?.sectionOrder?.length
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
  const eyebrow =
    hero.eyebrow || gallery.eyebrow || page.eyebrow || "Venue";
  const heroImage = hero.backgroundImage || page.image || images[0]?.url || "";

  const showMap =
    (modules?.flags.showMap ?? mapped.showMap ?? true) &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));

  const videosModule = normalizeVideosModule(modules?.videos);
  const showVideos = shouldRenderSection(videosModule, videos.length > 0);

  return (
    <>
      {heroImage ? (
        <DarkMediaHero
          id={hero._id || "hero"}
          image={heroImage}
          imageAlt={`${String(title)} — Nirvana Yoga School`}
        >
          <Container
            size="2xl"
            className="relative z-10 flex min-h-[52svh] flex-col justify-end pb-12 pt-28 lg:min-h-[58svh] lg:pb-16"
          >
            <p className="type-eyebrow mb-3 text-white/70">{eyebrow}</p>
            <h1 className="max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {subtitle}
              </p>
            ) : null}
            {images.length > 0 ? (
              <p className="mt-4 font-sans text-sm text-white/65">
                {images.length} photos
                {gallery.sectionOrder && gallery.sectionOrder.length > 0
                  ? ` · ${gallery.sectionOrder.length} collections`
                  : ""}
              </p>
            ) : null}
          </Container>
        </DarkMediaHero>
      ) : (
        <header className="border-b border-ink/8 bg-sand/30 pt-28 pb-10 sm:pt-32 sm:pb-12">
          <Container size="2xl">
            <p className="type-eyebrow text-primary">{eyebrow}</p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-5xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                {subtitle}
              </p>
            ) : null}
          </Container>
        </header>
      )}

      <article className="min-h-screen max-w-full overflow-x-clip bg-paper">
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
