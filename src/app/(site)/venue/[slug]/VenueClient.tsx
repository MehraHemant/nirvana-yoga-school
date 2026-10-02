"use client";

import dynamic from "next/dynamic";
import { PageHeroRenderer } from "@/components/courses";
import { HeroSection } from "@/components/home";
import VenueGallery from "@/components/venue/VenueGallery";
import {
  createEmptyGalleryModule,
  resolveGallerySections,
} from "@/content/mappers/gallery-module";
import { normalizeVenueHero } from "@/content/mappers/venue-hero";
import {
  mapVenueToHomeHero,
  venueHeroHasPlayableVideo,
  venueHeroHasStillContent,
} from "@/content/mappers/venue-home-hero";
import { isRetreatVenuePage } from "@/content/mappers/venue-page";
import type { GalleryModule } from "@/content/types/page-modules";
import type { SitePageGalleryImage } from "@/content/types/site-page";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { SiteFaq } from "../../_shared/site/shared";
import type { SiteClientProps } from "../../_shared/site/types";

/** Lightweight placeholder while a section chunk loads. */
function SectionSkeleton() {
  return <div className="w-full" aria-hidden="true" />;
}

const MapSection = dynamic(() => import("@/components/home/MapSection"), {
  loading: () => <SectionSkeleton />,
});

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
 * Venue page — video hero (course) or still/video hero (retreat), then gallery.
 * Retreat venue omits map and FAQ to match the live site.
 *
 * @param props - Mapped venue content and page modules
 */
export default function VenueClient({
  page,
  mapped,
  modules,
  siteMap,
}: SiteClientProps) {
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

  const isRetreatVenue = isRetreatVenuePage(page.slug);
  const heroModule = normalizeVenueHero(modules?.hero);
  const heroContent = mapVenueToHomeHero(heroModule);
  const hasVideoHero = venueHeroHasPlayableVideo(heroContent.video);
  const showVideoHero = shouldRenderSection(heroModule, hasVideoHero);
  const showStillHero =
    isRetreatVenue &&
    !hasVideoHero &&
    Boolean(modules) &&
    shouldRenderSection(heroModule, venueHeroHasStillContent(heroModule));
  const showHero = showVideoHero || showStillHero;

  const lightboxTitle = gallery.title?.trim() || page.title?.trim() || "";

  const showMap =
    !isRetreatVenue &&
    (modules?.flags.showMap ?? mapped.showMap ?? true) &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));

  return (
    <>
      {showVideoHero ? <HeroSection content={heroContent} /> : null}
      {showStillHero && modules ? (
        <PageHeroRenderer
          modules={{
            ...modules,
            hero: heroModule.heroImage?.trim()
              ? {
                  type: "simple-banner",
                  live: heroModule.live,
                  _id: heroModule._id,
                  eyebrow: heroModule.eyebrow,
                  title: heroModule.title,
                  subtitle:
                    heroModule.subtitle?.trim() ||
                    heroModule.description?.trim() ||
                    "",
                  backgroundImage: heroModule.heroImage,
                  ctaLabel: heroModule.ctaLabel,
                  ctaHref: heroModule.ctaHref,
                }
              : heroModule,
          }}
        />
      ) : null}

      <article
        className={
          showHero
            ? "max-w-full overflow-x-clip bg-white"
            : "max-w-full overflow-x-clip bg-white pt-(--site-header-height)"
        }
      >
        <VenueGallery
          gallery={gallery}
          images={images}
          lightboxTitle={lightboxTitle}
          variant={isRetreatVenue ? "retreat" : "default"}
        />
        {showMap && siteMap ? (
          <MapSection className="bg-white" content={siteMap} />
        ) : null}
        {isRetreatVenue ? null : <SiteFaq mapped={mapped} modules={modules} />}
      </article>
    </>
  );
}
