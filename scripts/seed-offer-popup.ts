/**
 * Seeds the site-wide offer popup (`global_settings.offerPopup`) with the
 * current offer, and moves its photo to Cloudinary (registered in the media
 * library so admins can reuse or swap it).
 *
 * Idempotent: reuses the uploaded asset on re-runs and overwrites the setting.
 * Edit afterwards in Admin → Engagement → Offer popup.
 *
 * Usage: npm run db:seed:offer-popup
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { OfferPopupContent } from "../src/content/types/offer-popup";
import { uploadToCloudinary } from "../src/lib/cdn/cloudinary";
import { createId, db, getPool } from "../src/lib/db/node";

const IMAGE_ALT =
  "Teacher adjusting a student's bow pose during yoga teacher training";
/** Media-library asset (2324×3480 portrait) used as the popup photo. */
const PORTRAIT_ALT = "Yoga Pose Astanga Portrait";
const LOCAL_IMAGE = path.join(
  process.cwd(),
  "public/images/home/banner_1.webp",
);

/**
 * Returns the Cloudinary URL for the popup photo: the high-res teaching
 * portrait already in the media library (sharp in the tall image panel),
 * falling back to uploading the local banner once.
 */
async function ensureImage(): Promise<string> {
  const portrait = await getPool().query<{ url: string }>(
    "select url from media_assets where alt = $1 and url like 'https://res.cloudinary.com/%' limit 1",
    [PORTRAIT_ALT],
  );
  if (portrait.rows[0]) return portrait.rows[0].url;

  const existing = await getPool().query<{ url: string }>(
    "select url from media_assets where alt = $1 and url like 'https://res.cloudinary.com/%' limit 1",
    ["Yoga teacher training graduates at Nirvana Yoga School"],
  );
  if (existing.rows[0]) return existing.rows[0].url;

  const buffer = await readFile(LOCAL_IMAGE);
  const uploaded = await uploadToCloudinary(buffer, {
    mime: "image/webp",
    filename: "offer-popup-graduates",
  });
  await db.mediaAsset.create({
    data: {
      id: createId(),
      url: uploaded.url,
      cdnKey: uploaded.cdnKey,
      mime: uploaded.mime,
      sizeBytes: uploaded.sizeBytes,
      width: uploaded.width,
      height: uploaded.height,
      alt: "Yoga teacher training graduates at Nirvana Yoga School",
      tags: ["offer"],
    },
  });
  console.log(`Uploaded popup image → ${uploaded.url}`);
  return uploaded.url;
}

async function main() {
  const image = await ensureImage();

  const value: OfferPopupContent = {
    live: true,
    eyebrow: "Yoga Teacher Training",
    title: "Limited Time Offer",
    discountLabel: "25%",
    description:
      "Book your Yoga Teacher Training in Rishikesh before the offer ends and save 25% on your course fee.",
    deadline: "2026-11-20",
    perks: [
      "Yoga Alliance certified teacher trainings",
      "Accommodation & sattvic meals included",
      "Secure your seat with just a 20% deposit",
    ],
    primaryCta: { label: "Book Now", href: "/booking" },
    secondaryCta: { label: "Enquire Now", href: "/enquire-now" },
    image,
    imageAlt: IMAGE_ALT,
    delaySeconds: 5,
    frequency: "session",
  };

  await db.globalSettings.upsert({
    where: { key: "offerPopup" },
    update: { value },
    create: { key: "offerPopup", value },
  });
  console.log(
    `Saved offerPopup: "${value.title}" ${value.discountLabel}, ends ${value.deadline}.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
