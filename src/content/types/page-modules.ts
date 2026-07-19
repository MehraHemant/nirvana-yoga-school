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
  categories?: string[];
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
