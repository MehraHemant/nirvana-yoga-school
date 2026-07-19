/**
 * Seeds gallery modules onto course-venue and retreat-venue pages.
 *
 * Usage: npx tsx --env-file=.env scripts/sync-venue-galleries.ts
 */
import sitePagesJson from "../src/content/data/site-pages/site-pages.json";
import {
  createCourseVenueGallery,
  createRetreatVenueGallery,
} from "../src/content/data/venue-galleries";
import { normalizeVenueHero } from "../src/content/mappers/venue-hero";
import { createEmptyPageModules } from "../src/content/page-modules-defaults";
import type { PageModulesDocument } from "../src/content/types";
import type { SitePageGalleryImage } from "../src/content/types/site-page";
import { db } from "../src/lib/db/node";

async function upsertVenueGallery(
  slug: string,
  gallery: NonNullable<PageModulesDocument["gallery"]>,
) {
  const page = await db.page.findUnique({
    where: { slug },
    select: { id: true, pageModules: true, image: true },
  });
  if (!page) {
    console.warn(`  skip (no page): ${slug}`);
    return;
  }

  const existing = (page.pageModules ??
    createEmptyPageModules("simple-banner")) as PageModulesDocument;
  const navItems: PageModulesDocument["stickyNav"]["items"] = [
    { id: "#gallery", label: "Gallery", shortLabel: "Gallery" },
  ];
  if (gallery.videos?.length) {
    navItems.push({ id: "#videos", label: "Videos", shortLabel: "Videos" });
  }
  navItems.push({ id: "#faq", label: "FAQ", shortLabel: "FAQ" });

  const fallbackImage = page.image || gallery.images[0]?.url || "";
  const hero = normalizeVenueHero(
    {
      type: "simple-banner",
      live: true,
      eyebrow: gallery.eyebrow || "Venue",
      title: gallery.title || ("title" in existing.hero ? existing.hero.title : "Venue"),
      subtitle: gallery.description,
      backgroundImage: fallbackImage,
    },
    fallbackImage,
  );

  const next: PageModulesDocument = {
    ...existing,
    hero,
    gallery,
    stickyNav: {
      live: true,
      items: navItems,
    },
    flags: {
      ...existing.flags,
      showExam: false,
      showAccommodation: false,
      showWhyNirvana: false,
      showTravel: false,
      showInstagram: false,
      showMap: false,
    },
  };

  await db.page.update({
    where: { slug },
    data: { pageModules: next },
  });

  await db.pageGalleryImage.deleteMany({ where: { pageId: page.id } });
  if (gallery.images.length > 0) {
    await db.pageGalleryImage.createMany({
      data: gallery.images.map((image, index) => ({
        pageId: page.id,
        url: image.url,
        category: image.category,
        sortOrder: index * 10,
      })),
    });
  }

  console.log(
    `  updated ${slug}: ${gallery.images.length} images, ${gallery.sectionOrder?.length ?? 0} sections`,
  );
}

/**
 * Ensures the course-venue page row exists (legacy content lived on `gallery`).
 *
 * @param courseImages - Flat gallery images from site-pages.json
 */
async function ensureCourseVenuePage(courseImages: SitePageGalleryImage[]) {
  const existing = await db.page.findUnique({
    where: { slug: "course-venue" },
    select: { id: true },
  });
  if (existing) return;

  const gallery = createCourseVenueGallery(courseImages);
  const source = await db.page.findUnique({
    where: { slug: "gallery" },
    select: { description: true, image: true },
  });

  const created = await db.page.create({
    data: {
      slug: "course-venue",
      type: "venue",
      eyebrow: "Course Venue",
      title: "Course Venue in Rishikesh",
      description:
        source?.description ||
        "Explore our yoga halls, dining, rooms, and campus.",
      image: source?.image || courseImages[0]?.url || "",
      published: true,
      pageModules: {
        ...createEmptyPageModules("page-minimal"),
        hero: {
          type: "page-minimal",
          eyebrow: "Course Venue",
          title: "Course Venue in Rishikesh",
          subtitle: "A detailed look at school amenities & facilities",
          description:
            source?.description ||
            "Explore our yoga halls, dining, rooms, and campus.",
          heroImage: source?.image || courseImages[0]?.url || "",
          ctaLabel: "Explore the Campus",
          ctaHref: "#gallery",
        },
        gallery,
        stickyNav: {
          live: true,
          items: [
            { id: "#gallery", label: "Gallery", shortLabel: "Gallery" },
            { id: "#faq", label: "FAQ", shortLabel: "FAQ" },
          ],
        },
        flags: {
          showExam: false,
          showAccommodation: false,
          showWhyNirvana: false,
          showTravel: false,
          showInstagram: false,
          showMap: false,
        },
      },
    },
  });

  if (gallery.images.length > 0) {
    await db.pageGalleryImage.createMany({
      data: gallery.images.map((image, index) => ({
        pageId: created.id,
        url: image.url,
        category: image.category,
        sortOrder: index * 10,
      })),
    });
  }

  console.log(`  created course-venue (${gallery.images.length} images)`);
}

async function main() {
  const galleryPage = sitePagesJson.gallery as {
    gallery?: SitePageGalleryImage[];
  };
  const courseImages = galleryPage.gallery ?? [];

  console.log("Syncing venue galleries…");
  await ensureCourseVenuePage(courseImages);
  await upsertVenueGallery(
    "course-venue",
    createCourseVenueGallery(courseImages),
  );
  await upsertVenueGallery("retreat-venue", createRetreatVenueGallery());
  console.log("Done.");
  console.log(
    "Note: restart `npm run dev` (or clear `.next/cache`) so Next.js drops stale page caches.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
