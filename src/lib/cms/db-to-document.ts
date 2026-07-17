import type {
  SitePageCard,
  SitePageDocument,
  SitePageGalleryImage,
  SitePageHighlight,
  SitePagePackage,
  SitePagePerson,
  SitePageSection,
  SitePageSubsection,
} from "@/content/types";

/**
 * Include tree for loading a page with ordered child relations.
 * Pass to `prisma.page.findUnique({ include: pageWithRelations })`.
 */
export const pageWithRelations = {
  sections: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      subsections: {
        orderBy: { sortOrder: "asc" as const },
        include: {
          items: { orderBy: { sortOrder: "asc" as const } },
        },
      },
      items: { orderBy: { sortOrder: "asc" as const } },
    },
  },
  packages: { orderBy: { sortOrder: "asc" as const } },
  gallery: { orderBy: { sortOrder: "asc" as const } },
  cards: { orderBy: { sortOrder: "asc" as const } },
  people: { orderBy: { sortOrder: "asc" as const } },
  highlights: { orderBy: { sortOrder: "asc" as const } },
};

/** Subsection item row returned by page includes. */
type SubsectionItemRow = {
  id: string;
  subsectionId: string;
  sortOrder: number;
  value: string;
};

/** Section item row returned by page includes. */
type SectionItemRow = {
  id: string;
  sectionId: string;
  sortOrder: number;
  value: string;
};

/** Subsection row with nested items. */
type SubsectionRow = {
  id: string;
  sectionId: string;
  sortOrder: number;
  title: string;
  body: string | null;
  image: string | null;
  items: SubsectionItemRow[];
};

/** Section row with nested subsections and items. */
type SectionRow = {
  id: string;
  pageId: string;
  sortOrder: number;
  title: string;
  eyebrow: string | null;
  body: string | null;
  layout: string;
  image: string | null;
  images: unknown;
  blocks: unknown;
  subsections: SubsectionRow[];
  items: SectionItemRow[];
};

/** Page package row. */
type PackageRow = {
  id: string;
  pageId: string;
  sortOrder: number;
  title: string;
  price: string;
  image: string | null;
};

/** Gallery image row. */
type GalleryRow = {
  id: string;
  pageId: string;
  sortOrder: number;
  url: string;
  category: string;
  mediaAssetId: string | null;
};

/** Card row. */
type CardRow = {
  id: string;
  pageId: string;
  sortOrder: number;
  title: string;
  description: string;
  href: string | null;
};

/** Person row. */
type PersonRow = {
  id: string;
  pageId: string;
  sortOrder: number;
  name: string;
  image: string | null;
  summary: string | null;
  bio: string | null;
  education: unknown;
  experience: unknown;
  expertise: unknown;
};

/** Highlight row. */
type HighlightRow = {
  id: string;
  pageId: string;
  sortOrder: number;
  title: string;
  description: string;
  image: string | null;
};

/**
 * Page row shape returned when loaded with `pageWithRelations`.
 */
export type PageWithRelations = {
  id: string;
  slug: string;
  type: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  fee: string;
  duration: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  published: boolean;
  contentTypeId: string | null;
  contentData: unknown;
  createdAt: Date;
  updatedAt: Date;
  pageModules: unknown;
  sections: SectionRow[];
  packages: PackageRow[];
  gallery: GalleryRow[];
  cards: CardRow[];
  people: PersonRow[];
  highlights: HighlightRow[];
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapSubsection(subsection: SubsectionRow): SitePageSubsection {
  const itemsFromTable = subsection.items.map((item) => item.value);
  return {
    title: subsection.title,
    body: subsection.body ?? undefined,
    image: subsection.image ?? undefined,
    items: itemsFromTable.length > 0 ? itemsFromTable : undefined,
  };
}

function mapSection(section: SectionRow): SitePageSection {
  const images = asStringArray(section.images);
  const items = section.items.map((item) => item.value);
  const subsections = section.subsections.map(mapSubsection);

  return {
    title: section.title,
    eyebrow: section.eyebrow ?? undefined,
    body: section.body ?? undefined,
    layout: (section.layout as SitePageSection["layout"]) ?? "default",
    image: section.image ?? undefined,
    images: images.length > 0 ? images : undefined,
    items: items.length > 0 ? items : undefined,
    subsections: subsections.length > 0 ? subsections : undefined,
    blocks: section.blocks
      ? (section.blocks as SitePageSection["blocks"])
      : undefined,
  };
}

/**
 * Map a page row (with relations) to `SitePageDocument`.
 *
 * @param page - Page loaded with `pageWithRelations`
 */
export function mapPageToSitePageDocument(
  page: PageWithRelations,
): SitePageDocument {
  const sections = page.sections.map(mapSection);
  const packages: SitePagePackage[] | undefined =
    page.packages.length > 0
      ? page.packages.map((pkg) => ({
          title: pkg.title,
          price: pkg.price,
          image: pkg.image ?? undefined,
        }))
      : undefined;

  const gallery: SitePageGalleryImage[] | undefined =
    page.gallery.length > 0
      ? page.gallery.map((image) => ({
          url: image.url,
          category: image.category,
        }))
      : undefined;

  const cards: SitePageCard[] | undefined =
    page.cards.length > 0
      ? page.cards.map((card) => ({
          title: card.title,
          description: card.description,
          href: card.href ?? undefined,
        }))
      : undefined;

  const people: SitePagePerson[] | undefined =
    page.people.length > 0
      ? page.people.map((person) => ({
          name: person.name,
          image: person.image ?? undefined,
          summary: person.summary ?? undefined,
          bio: person.bio ?? undefined,
          education: asStringArray(person.education),
          experience: asStringArray(person.experience),
          expertise: asStringArray(person.expertise),
        }))
      : undefined;

  const highlights: SitePageHighlight[] | undefined =
    page.highlights.length > 0
      ? page.highlights.map((highlight) => ({
          title: highlight.title,
          description: highlight.description,
          image: highlight.image ?? undefined,
        }))
      : undefined;

  return {
    slug: page.slug,
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description,
    image: page.image,
    sections,
    highlights,
    people,
    packages,
    gallery,
    cards,
    ctaLabel: page.ctaLabel ?? undefined,
    ctaHref: page.ctaHref ?? undefined,
    presentation: parsePresentation(page.contentData),
  };
}

/**
 * Read teacher/home presentation fields from `content_data`.
 *
 * @param value - Raw JSON column
 */
function parsePresentation(
  value: unknown,
): SitePageDocument["presentation"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const pick = (key: string) =>
    typeof record[key] === "string" ? (record[key] as string) : undefined;
  const presentation = {
    heroQuote: pick("heroQuote"),
    heroLead: pick("heroLead"),
    sectionEyebrow: pick("sectionEyebrow"),
    sectionTitle: pick("sectionTitle"),
    sectionDescription: pick("sectionDescription"),
    homeEyebrow: pick("homeEyebrow"),
    homeTitle: pick("homeTitle"),
    homeDescription: pick("homeDescription"),
  };
  const hasAny = Object.values(presentation).some(Boolean);
  return hasAny ? presentation : undefined;
}
