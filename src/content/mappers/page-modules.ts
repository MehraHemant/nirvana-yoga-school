import type {
  BentoMediaHero,
  MappedPageModules,
  PageModulesDocument,
} from "@/content/types/page-modules";
import type { CourseMedia } from "@/content/types/shared";

/**
 * Extract hero media arrays from a page modules document.
 *
 * @param modules - Page modules document
 */
export function extractMediaFromModules(
  modules: PageModulesDocument,
): CourseMedia {
  const hero = modules.hero;
  if (hero.type === "bento-media") {
    return {
      images: hero.images ?? hero.heroImages ?? [],
      imageDetails: hero.imageDetails,
      videos: hero.videos ?? [],
    };
  }
  if (hero.type === "split-copy") {
    return {
      images: hero.previewType === "image" ? [hero.previewUrl] : [],
      videos: hero.previewType === "video" ? [hero.previewUrl] : [],
    };
  }
  if (hero.type === "simple-banner") {
    return { images: [hero.backgroundImage], videos: [] };
  }
  return { images: [hero.heroImage], videos: [] };
}

/**
 * Map page modules to frontend-ready props bundle.
 *
 * @param modules - Page modules document
 */
export function mapPageModules(
  modules: PageModulesDocument,
): MappedPageModules {
  const media = extractMediaFromModules(modules);
  const hero = modules.hero;

  const metaItems =
    hero.type === "split-copy" || hero.type === "simple-banner"
      ? (hero.metaItems ?? [])
      : hero.type === "bento-media"
        ? [
            hero.duration ? { label: "Duration", value: hero.duration } : null,
            hero.level ? { label: "Level", value: hero.level } : null,
            hero.certification
              ? { label: "Certification", value: hero.certification }
              : null,
            hero.fee ? { label: "Fee", value: hero.fee } : null,
          ].filter((item): item is { label: string; value: string } =>
            Boolean(item),
          )
        : [];

  const heroImages =
    hero.type === "bento-media"
      ? (hero.heroImages ?? hero.images ?? [])
      : hero.type === "page-minimal"
        ? [hero.heroImage]
        : hero.type === "simple-banner"
          ? [hero.backgroundImage]
          : hero.type === "split-copy" && hero.previewType === "image"
            ? [hero.previewUrl]
            : [];

  return {
    modules,
    heroImages,
    metaItems,
    videos: media.videos ?? [],
    imageDetails: media.imageDetails,
  };
}

/**
 * Resolve bento hero props from modules for CourseHero.
 *
 * @param modules - Page modules document
 */
export function resolveBentoHeroProps(modules: PageModulesDocument) {
  const hero = modules.hero;
  if (hero.type !== "bento-media") return null;

  return {
    title: hero.title,
    subtitle: hero.subtitle,
    duration: hero.duration,
    level: hero.level,
    certification: hero.certification,
    fee: hero.fee,
    image: hero.heroImages?.[0] ?? hero.images?.[0] ?? "",
    certBadge: hero.certBadge,
    heroImages: hero.heroImages,
    images: hero.images,
    imageDetails: hero.imageDetails,
    videos: hero.videos,
    disableSupplemental: hero.disableSupplemental,
  } satisfies Partial<BentoMediaHero> & { image: string };
}
