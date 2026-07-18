import { PrismaClient } from "@prisma/client";
import { DEFAULT_HOME_PAGE_CONTENT } from "../src/content/data/dedicated-page-defaults";
import { DEFAULT_TRAVEL_GUIDE } from "../src/content/data/travel-guide-defaults";
import { createDefaultWhyNirvana } from "../src/content/data/why-nirvana-defaults";
import { TEACHER_PAGE_SLUG } from "../src/content/teachers-slug";
import { FALLBACK_INSTAGRAM_FEED } from "../src/lib/instagram";

const prisma = new PrismaClient();

/**
 * Upserts the four shared CMS keys (Why Nirvana, Map, Instagram, Travel).
 * Faculty page seeding stays in `npm run db:seed` (uses app DB helpers).
 */
async function main() {
  const whyNirvana = createDefaultWhyNirvana();
  const siteMap = {
    live: true,
    eyebrow: DEFAULT_HOME_PAGE_CONTENT.map.eyebrow,
    title: DEFAULT_HOME_PAGE_CONTENT.map.title,
    description: DEFAULT_HOME_PAGE_CONTENT.map.description,
    embedUrl: DEFAULT_HOME_PAGE_CONTENT.map.embedUrl,
    iframeTitle: DEFAULT_HOME_PAGE_CONTENT.map.iframeTitle,
  };
  const instagram = {
    live: true,
    username: FALLBACK_INSTAGRAM_FEED.username,
    displayName: FALLBACK_INSTAGRAM_FEED.displayName,
    bio: FALLBACK_INSTAGRAM_FEED.bio,
    website: FALLBACK_INSTAGRAM_FEED.website,
    profileUrl: FALLBACK_INSTAGRAM_FEED.profileUrl,
    postsCount: FALLBACK_INSTAGRAM_FEED.postsCount,
    followersCount: FALLBACK_INSTAGRAM_FEED.followersCount,
    followingCount: FALLBACK_INSTAGRAM_FEED.followingCount,
    media: FALLBACK_INSTAGRAM_FEED.media.map((item) => ({ ...item })),
  };
  const travel = {
    ...DEFAULT_TRAVEL_GUIDE,
    quickFacts: DEFAULT_TRAVEL_GUIDE.quickFacts.map((f) => ({ ...f })),
    topics: DEFAULT_TRAVEL_GUIDE.topics.map((t) => ({ ...t })),
  };

  for (const [key, value] of Object.entries({
    whyNirvana,
    siteMap,
    instagram,
    travel,
  })) {
    await prisma.globalSettings.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    console.log("upserted", key);
  }

  const teacher = await prisma.page.findUnique({
    where: { slug: TEACHER_PAGE_SLUG },
    include: { _count: { select: { people: true } } },
  });
  if (!teacher?.published || teacher._count.people === 0) {
    console.warn(
      `Teacher page missing or empty — run \`npm run db:seed\` to seed faculty.`,
    );
  } else {
    console.log("teacher page ok", teacher._count.people, "people");
  }

  const keys = await prisma.globalSettings.findMany({ select: { key: true } });
  console.log(
    "keys:",
    keys
      .map((k) => k.key)
      .sort()
      .join(", "),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
