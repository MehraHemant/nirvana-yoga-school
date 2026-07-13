import { prisma } from "@/lib/db";

export type MediaUsageResult = {
  inUse: boolean;
  references: string[];
};

/**
 * Escape special characters for SQL LIKE patterns.
 *
 * @param value - Raw URL substring
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/**
 * Count rows where a JSON/text column contains the asset URL.
 *
 * @param table - Table name
 * @param column - Column name
 * @param pattern - LIKE pattern
 */
async function countJsonContains(
  table: string,
  column: string,
  pattern: string,
): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) AS count FROM \`${table}\` WHERE CAST(\`${column}\` AS CHAR) LIKE ? ESCAPE '\\\\'`,
    pattern,
  );
  return Number(rows[0]?.count ?? 0);
}

/**
 * Check whether a media asset URL is referenced anywhere in the CMS database.
 *
 * @param asset - Media asset id and public URL
 * @returns Usage summary with human-readable reference labels
 */
export async function getMediaAssetUsage(asset: {
  id: string;
  url: string;
}): Promise<MediaUsageResult> {
  const references: string[] = [];
  const pattern = `%${escapeLikePattern(asset.url)}%`;

  const galleryCount = await prisma.pageGalleryImage.count({
    where: {
      OR: [{ mediaAssetId: asset.id }, { url: asset.url }],
    },
  });
  if (galleryCount > 0) {
    references.push(`${galleryCount} gallery row(s)`);
  }

  const pageHeroCount = await prisma.page.count({
    where: { image: asset.url },
  });
  if (pageHeroCount > 0) {
    references.push(`${pageHeroCount} page hero image(s)`);
  }

  const sectionImageCount = await prisma.pageSection.count({
    where: { image: asset.url },
  });
  if (sectionImageCount > 0) {
    references.push(`${sectionImageCount} page section image(s)`);
  }

  const sectionImagesJson = await countJsonContains(
    "page_sections",
    "images",
    pattern,
  );
  if (sectionImagesJson > 0) {
    references.push(`${sectionImagesJson} section gallery JSON`);
  }

  const subsectionCount = await prisma.sectionSubsection.count({
    where: { image: asset.url },
  });
  if (subsectionCount > 0) {
    references.push(`${subsectionCount} subsection image(s)`);
  }

  const packageCount = await prisma.pagePackage.count({
    where: { image: asset.url },
  });
  if (packageCount > 0) {
    references.push(`${packageCount} package image(s)`);
  }

  const peopleCount = await prisma.pagePerson.count({
    where: { image: asset.url },
  });
  if (peopleCount > 0) {
    references.push(`${peopleCount} teacher/people image(s)`);
  }

  const highlightCount = await prisma.pageHighlight.count({
    where: { image: asset.url },
  });
  if (highlightCount > 0) {
    references.push(`${highlightCount} highlight image(s)`);
  }

  const blogCount = await prisma.blogPost.count({
    where: { image: asset.url },
  });
  if (blogCount > 0) {
    references.push(`${blogCount} blog post image(s)`);
  }

  const modulesCount = await countJsonContains(
    "pages",
    "page_modules",
    pattern,
  );
  if (modulesCount > 0) {
    references.push(`${modulesCount} page module JSON`);
  }

  const courseDocCount = await countJsonContains(
    "course_documents",
    "document",
    pattern,
  );
  if (courseDocCount > 0) {
    references.push(`${courseDocCount} course document JSON`);
  }

  const blogContentCount = await countJsonContains(
    "blog_posts",
    "content",
    pattern,
  );
  if (blogContentCount > 0) {
    references.push(`${blogContentCount} blog content JSON`);
  }

  const blogHtmlCount = await countJsonContains(
    "blog_posts",
    "body_html",
    pattern,
  );
  if (blogHtmlCount > 0) {
    references.push(`${blogHtmlCount} blog body HTML`);
  }

  const sectionBlocksCount = await countJsonContains(
    "page_sections",
    "blocks",
    pattern,
  );
  if (sectionBlocksCount > 0) {
    references.push(`${sectionBlocksCount} section blocks JSON`);
  }

  return {
    inUse: references.length > 0,
    references,
  };
}

/**
 * Batch usage lookup for media library list views.
 *
 * @param assets - Assets to check
 * @returns Map of asset id → usage result
 */
export async function getMediaAssetsUsage(
  assets: { id: string; url: string }[],
): Promise<Map<string, MediaUsageResult>> {
  const map = new Map<string, MediaUsageResult>();
  await Promise.all(
    assets.map(async (asset) => {
      map.set(asset.id, await getMediaAssetUsage(asset));
    }),
  );
  return map;
}
