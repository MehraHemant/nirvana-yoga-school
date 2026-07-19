/**
 * Seeds a clean, Content-Hub-ONE-style content set: resets all content items /
 * references, then creates a small set of real, site-shaped items using only
 * the field types the website actually renders (`CmsPageContent`).
 *
 * Usage:
 *   npm run db:seed-content        # wipe + seed sample content
 */
import {
  createContentItem,
  setContentItemPublished,
  updateContentItemData,
} from "@/lib/cms/content-items";
import { syncDefaultContentTypes } from "@/lib/cms/content-types";
import { db } from "@/lib/db";

/**
 * Creates a published component item of a given type and returns its id.
 *
 * @param typeKey - Content-type key (e.g. `hero`, `faq`)
 * @param name - Admin label for the item
 * @param data - Field values for the type
 * @returns The new item id
 */
async function section(
  typeKey: string,
  name: string,
  data: Record<string, unknown>,
): Promise<string> {
  const created = await createContentItem({ typeKey, name });
  if (!created.data)
    throw new Error(`Create failed for ${typeKey}: ${created.error}`);
  await updateContentItemData(created.data.id, data);
  await setContentItemPublished(created.data.id, true);
  return created.data.id;
}

/**
 * Creates a published page item that links the given section items in order.
 *
 * @param slug - Page slug (served at `/slug`)
 * @param title - Page title
 * @param meta - Page meta (description, eyebrow, image, cta)
 * @param sectionIds - Ordered linked section item ids
 */
async function page(
  slug: string,
  title: string,
  meta: Record<string, unknown>,
  sectionIds: string[],
): Promise<void> {
  const created = await createContentItem({
    typeKey: "page",
    name: title,
    slug,
  });
  if (!created.data) throw new Error(`Create page failed: ${created.error}`);
  await updateContentItemData(created.data.id, {
    title,
    ...meta,
    sections: sectionIds,
  });
  await setContentItemPublished(created.data.id, true);
  console.log(`• /${slug} → ${sectionIds.length} sections`);
}

async function main() {
  // Reset first so pruning obsolete content types (which cascade-delete their
  // items) is never blocked by a reference `to_id` RESTRICT constraint.
  await db.contentReference.deleteMany({});
  await db.contentItem.deleteMany({});
  console.log("• Reset content items + references.");

  await syncDefaultContentTypes();
  console.log("• Synced lean content types.");

  // —— About page ——
  const aboutHero = await section("hero", "About · Hero", {
    eyebrow: "Our story",
    headline: "A yoga school rooted in Rishikesh",
    summary:
      "Since 2012, Nirvana Yoga School has trained teachers in the birthplace of yoga with an authentic Hatha, Ashtanga, and Vinyasa lineage.",
    hero_image:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80",
    cta_label: "Enquire now",
    cta_href: "/enquire-now",
  });

  const aboutStory = await section("about", "About · Story", {
    headline: "Who we are",
    summary:
      "A Yoga Alliance certified school on the banks of the Ganges in Tapovan, Rishikesh.",
    mission:
      "To share authentic, safe, and transformative yoga education rooted in tradition.",
    vision:
      "A world where every student leaves as a confident, grounded teacher.",
    body: "<p>Our teachers carry decades of combined experience across asana, pranayama, philosophy, and anatomy. Small batches keep learning personal.</p>",
    portrait_image:
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=1200&q=80",
  });

  const aboutFaq = await section("faq", "About · FAQ", {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      {
        question: "Where is the school located?",
        answer: "Tapovan, Rishikesh — the foothills of the Himalayas.",
      },
      {
        question: "Are the courses Yoga Alliance certified?",
        answer: "Yes. We are a registered RYS offering RYT-200, 300, and 500.",
      },
    ],
  });

  const aboutContact = await section("contact", "About · Contact", {
    headline: "Get in touch",
    summary: "We usually reply within a day.",
    email: "hello@nirvanayogaschoolindia.com",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    address: "Tapovan, Rishikesh, Uttarakhand 249192, India",
    hours: "Mon–Sat, 8am–6pm IST",
  });

  await page(
    "about",
    "About Nirvana Yoga School",
    {
      description:
        "Learn about Nirvana Yoga School — a Yoga Alliance certified school in Rishikesh, India.",
      eyebrow: "Est. 2012 · Rishikesh",
      image:
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80",
    },
    [aboutHero, aboutStory, aboutFaq, aboutContact],
  );

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
