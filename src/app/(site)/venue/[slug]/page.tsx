import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSitePage } from "@/content";
import {
  normalizeVideosModule,
  videosModuleHasClips,
} from "@/content/mappers/videos-module";
import { getPageModules } from "@/content/repositories/page-modules";
import { fetchPageSlugsByTypeFromDb } from "@/lib/cms/cache";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { resolvePlaylistVideos } from "@/lib/playlist-video";
import { metadataFromPageSeo } from "../../_shared/metadata";
import { loadSitePageDataAsync } from "../../_shared/site/data.server";
import VenueClient from "./VenueClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Build static paths from published venue slugs in the database.
 */
export async function generateStaticParams() {
  const slugs = await fetchPageSlugsByTypeFromDb("venue");
  return slugs.map((slug) => ({ slug }));
}

/**
 * Venue SEO from CMS modules meta (admin SEO panel), else page meta.
 *
 * @param props - Route params with venue slug
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [modulesResult, pageResult] = await Promise.all([
    getPageModules(slug).catch(() => null),
    getSitePage(slug).catch(() => null),
  ]);
  return metadataFromPageSeo(
    modulesResult?.data?.meta ?? pageResult?.data?.meta,
  );
}

/**
 * Venue gallery page — photos loaded from `page_gallery_images` + page modules.
 */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const result = await getSitePage(slug);
  if (!result.data) notFound();

  const data = await loadSitePageDataAsync(result.data);
  const videosModule = normalizeVideosModule(data.modules?.videos);
  const showVideos = shouldRenderSection(
    videosModule,
    videosModuleHasClips(videosModule),
  );
  const videos = showVideos
    ? await resolvePlaylistVideos(videosModule.items)
    : [];

  return (
    <VenueClient
      page={data.page}
      mapped={data.mapped}
      teachers={data.teachers}
      modules={data.modules}
      residentialLife={data.residentialLife}
      whyNirvana={data.whyNirvana}
      reviews={data.reviews}
      siteMap={data.siteMap}
      instagram={data.instagram}
      travel={data.travel}
      examCertification={data.examCertification}
      videos={videos}
    />
  );
}
