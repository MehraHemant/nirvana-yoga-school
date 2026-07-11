import type { Prisma } from "@prisma/client";
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
} satisfies Prisma.PageInclude;

export type PageWithRelations = Prisma.PageGetPayload<{
  include: typeof pageWithRelations;
}>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapSubsection(
  subsection: PageWithRelations["sections"][number]["subsections"][number],
): SitePageSubsection {
  const itemsFromTable = subsection.items.map((item) => item.value);
  return {
    title: subsection.title,
    body: subsection.body ?? undefined,
    image: subsection.image ?? undefined,
    items: itemsFromTable.length > 0 ? itemsFromTable : undefined,
  };
}

function mapSection(
  section: PageWithRelations["sections"][number],
): SitePageSection {
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
 * Map a Prisma page row (with relations) to `SitePageDocument`.
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
  };
}
