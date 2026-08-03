import type { CmsInteractiveImage } from "@/content/types/cms-image";
import type { PageSeoMeta } from "@/content/types/page-seo";
import type {
  CourseImageDetail,
  CoursePricingOption,
  CourseScheduleItem,
  CourseSyllabusSection,
  FAQ,
  StickyNavItem,
} from "@/content/types/shared";
import type {
  SitePageCard,
  SitePageGalleryImage,
} from "@/content/types/site-page";

/**
 * Per-module live flag + optional HTML `_id` persisted in `page_modules` JSON.
 * Omit or `true` = shown; `live: false` hides the module on the public page.
 * When `_id` is set, it is used as the public section HTML `id`.
 */
export type ModuleLiveFields = {
  /** Optional section id (admin panel + public section `id` when set) */
  _id?: string;
  /** When false, this module is hidden on the public page. Default true. */
  live?: boolean;
};

/** Hero layout variants — fields in CMS change per type. */
export type HeroType =
  | "bento-media"
  | "split-copy"
  | "simple-banner"
  | "page-minimal";

export type MetaItem = { label: string; value: string };

export type BentoMediaHero = ModuleLiveFields & {
  type: "bento-media";
  title: string;
  subtitle?: string;
  duration?: string;
  level?: string;
  certification?: string;
  fee?: string;
  certBadge?: string;
  /** Hero gallery slides — filmstrip uses these only (CMS / DB) */
  heroImages?: Array<string | CmsInteractiveImage>;
  imageDetails?: CourseImageDetail[];
  /** YouTube watch / youtu.be URLs (legacy bare video IDs still accepted) */
  videos?: string[];
};

export type SplitCopyHero = ModuleLiveFields & {
  type: "split-copy";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  metaItems?: MetaItem[];
  ctaPrimary?: string;
  ctaPrimaryHref?: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
  previewType: "image" | "video";
  previewUrl: string;
};

export type SimpleBannerHero = ModuleLiveFields & {
  type: "simple-banner";
  /** Small label above the title (venue / banner pages) */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  metaItems?: MetaItem[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type PageMinimalHero = ModuleLiveFields & {
  type: "page-minimal";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  heroImage: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Homepage-style hero first line (falls back to `title`) */
  titleLead?: string;
  /** Homepage-style hero accent phrase */
  titleAccent?: string;
  /** Bottom marquee strip items (homepage hero pattern) */
  marqueeItems?: string[];
  /** Mobile trust chips under the CTA (homepage hero pattern) */
  mobileTrust?: Array<{ value: string; label: string }>;
  /**
   * Optional full-bleed background video (homepage hero pattern).
   * Posters fall back to `heroImage` when unset.
   */
  heroVideo?: import("@/content/types/dedicated-pages").HomeHeroVideoContent;
};

export type HeroModule =
  | BentoMediaHero
  | SplitCopyHero
  | SimpleBannerHero
  | PageMinimalHero;

export type OverviewMediaItem = {
  type: "image" | "video";
  url: string;
  title?: string;
  description?: string;
  /** Alt text for image media */
  alt?: string;
  /** Optional poster for video media (YouTube thumbnail fallback when empty) */
  poster?: string;
  /** Click behaviour for image media */
  clickAction?: import("@/content/types/cms-image").ImageClickAction;
  /** Redirect target when clickAction is `redirect` */
  redirectUrl?: string;
};

export type GlanceItem = {
  label: string;
  value: string;
  hint?: string;
};

export type OverviewModule = ModuleLiveFields & {
  eyebrow: string;
  title: string;
  lead: string;
  supportingCopy?: string;
  glance: GlanceItem[];
  media: {
    mode: "image" | "video" | "carousel";
    items: OverviewMediaItem[];
  };
  /** Vision labeled block (homepage / YTT welcome pattern) */
  vision?: { label: string; body: string };
  /** Promise labeled block (homepage / YTT welcome pattern) */
  promise?: { label: string; body: string };
  /** Checklist under the lead (welcome-style overview) */
  highlights?: string[];
  /** Rotating stats card (image collage layout; unused when video is set) */
  rotatingStats?: Array<{ value: string; label: string }>;
  /** Primary CTA label for welcome-style overview */
  ctaLabel?: string;
  /** Primary CTA href for welcome-style overview */
  ctaHref?: string;
};

export type InclusionsModule = ModuleLiveFields & {
  eyebrow?: string;
  title?: string;
  description?: string;
  items: string[];
};

export type EligibilityRequirement = {
  num: string;
  title: string;
  desc: string;
};

export type EligibilityModule = ModuleLiveFields & {
  eyebrow?: string;
  title?: string;
  description?: string;
  requirements: EligibilityRequirement[];
  showAllianceBadge?: boolean;
};

export type SyllabusModule = ModuleLiveFields & {
  description: string;
  chapters: CourseSyllabusSection[];
};

export type ScheduleModule = ModuleLiveFields & {
  description: string;
  items: CourseScheduleItem[];
};

export type PricingBatch = {
  dates: string;
  spaces: string;
  status: string;
  statusColor: string;
  tone: "open" | "fast" | "last";
};

export type PricingModule = ModuleLiveFields & {
  description: string;
  duration?: string;
  options: CoursePricingOption[];
  batches?: PricingBatch[];
};

export type FaqsModule = ModuleLiveFields & {
  items: FAQ[];
};

/**
 * Teachers band on a page — picks faculty from the `/teacher` data store.
 * Frontend resolves `selectedSlugs` via `getTeachers()` / `teacherSlug`.
 */
export type TeachersModule = ModuleLiveFields & {
  /** Faculty slugs (`teacherSlug(name)`) selected for this page */
  selectedSlugs: string[];
};

/** Ordered gallery section metadata (admin reorder of categories). */
export type GallerySectionMeta = {
  id: string;
  label: string;
  description?: string;
};

/** YouTube clip shown in the venue video strip. */
export type GalleryVideoItem = {
  /** YouTube video id (preferred) or full watch URL */
  url: string;
  title?: string;
};

export type GalleryModule = ModuleLiveFields & {
  eyebrow?: string;
  title?: string;
  description?: string;
  images: SitePageGalleryImage[];
  /** Ordered section list; when omitted, order follows first appearance in `images` */
  sectionOrder?: GallerySectionMeta[];
  videos?: GalleryVideoItem[];
};

/** Source kind for a videos-module playlist item. */
export type VideosModuleItemType = "youtube" | "cloudinary";

/**
 * One clip in `page_modules.videos` — YouTube URL or Cloudinary upload.
 */
export type VideosModuleItem = {
  type: VideosModuleItemType;
  /** YouTube watch URL or 11-character id when `type` is `youtube` */
  youtubeUrl?: string;
  /** Secure Cloudinary delivery URL when `type` is `cloudinary` */
  cloudinaryUrl?: string;
  /** Cloudinary `public_id` for the uploaded video */
  publicId?: string;
  /** Optional display title (overrides YouTube title when set) */
  title?: string;
  /** Optional poster URL (Cloudinary still or custom) */
  thumbnailUrl?: string;
  /** Optional duration in seconds (from Cloudinary upload metadata) */
  durationSeconds?: number;
};

/**
 * Dedicated video playlist section (venue and other module pages).
 * Stored at `page_modules.videos`.
 * Prefer `items` for mixed YouTube / Cloudinary sources; `youtubeUrls` is
 * kept in sync for legacy readers and older DB documents.
 */
export type VideosModule = ModuleLiveFields & {
  eyebrow?: string;
  title?: string;
  description?: string;
  /**
   * Legacy YouTube-only list (watch URLs or 11-character ids).
   * Normalized from / synced with YouTube `items`.
   */
  youtubeUrls: string[];
  /** Mixed-source playlist (YouTube and/or Cloudinary) */
  items: VideosModuleItem[];
};

export type ProgramsModule = ModuleLiveFields & {
  cards: SitePageCard[];
};

/**
 * Page-level toggles for shared/static sections (not per-module CMS blocks).
 * `true` = include on this page when the shared content is also live + has data.
 */
export type ModuleFlags = {
  showExam: boolean;
  showAccommodation: boolean;
  showWhyNirvana: boolean;
  showTravel: boolean;
  showInstagram: boolean;
  showMap: boolean;
};

/** Full page content stored in `Page.pageModules` JSON. */
export type PageModulesDocument = {
  /** Optional page-level SEO (admin-editable; used by public `generateMetadata`) */
  meta?: PageSeoMeta;
  hero: HeroModule;
  stickyNav: ModuleLiveFields & { items: StickyNavItem[] };
  overview: OverviewModule;
  inclusions: InclusionsModule;
  eligibility: EligibilityModule;
  syllabus: SyllabusModule;
  schedule: ScheduleModule;
  pricing: PricingModule;
  faqs: FaqsModule;
  teachers?: TeachersModule;
  gallery?: GalleryModule;
  /** YouTube playlist band — venue pages and other layouts that opt in */
  videos?: VideosModule;
  programs?: ProgramsModule;
  /**
   * Per-page lodging & food (course/retreat/venue/hub/kirtan). Not a global shared section.
   * When omitted, frontend may fall back to legacy `global_settings.residentialLife`.
   */
  residentialLife?: import("@/content/types/shared-sections").ResidentialLifeContent;
  /**
   * @deprecated Prefer `residentialLife` (same as yoga courses). Kept so legacy
   * retreat pages can migrate until they are re-saved in admin.
   */
  retreatAccommodation?: import("@/content/types/shared-sections").RetreatAccommodationContent;
  flags: ModuleFlags;
};

/** Mapped props bundle for frontend page clients. */
export type MappedPageModules = {
  modules: PageModulesDocument;
  heroImages: string[];
  metaItems: MetaItem[];
  videos: string[];
  imageDetails?: CourseImageDetail[];
};
