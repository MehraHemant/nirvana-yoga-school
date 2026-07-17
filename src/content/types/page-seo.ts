/**
 * Shared page-level SEO and optional section HTML id fields.
 * Used by home, dedicated pages, module pages, and site pages.
 */

/**
 * Page-level SEO metadata edited in admin “Page metadata” panels.
 * Field names align with site-config `defaultSeo` (`title`, `description`, `ogImage`).
 */
export type PageSeoMeta = {
  /** Document / Open Graph title */
  title?: string;
  /** Meta description */
  description?: string;
  /** Open Graph / Twitter image URL */
  ogImage?: string;
  /** Comma-separated or freeform keywords string */
  keywords?: string;
  /** When true, sets robots noindex on the public page */
  noIndex?: boolean;
};

/**
 * Optional CMS section id + live flag stored on section/module objects.
 * When `_id` is set, it is used as the public (and admin panel) HTML `id`.
 * `live: false` hides the section on the public site (default live).
 */
export type SectionIdFields = {
  /** Optional section id (admin panel + public section `id` when set) */
  _id?: string;
  /** When false, section is hidden on the public site. Default true. */
  live?: boolean;
};
