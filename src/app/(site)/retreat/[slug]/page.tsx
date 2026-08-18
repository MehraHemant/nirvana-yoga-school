import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRetreat, getRetreatSlugs, getSitePage } from "@/content";
import { getPageModules } from "@/content/repositories/page-modules";
import { metadataForSlug } from "../../_shared/metadata";
import { loadSitePageDataAsync } from "../../_shared/site/data.server";
import { loadRetreatPageData } from "./data";
import LegacyRetreatClient from "./LegacyRetreatClient";
import RetreatClient from "./RetreatClient";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Build static paths from published retreat slugs in MySQL.
 */
export async function generateStaticParams() {
  const slugs = await getRetreatSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Retreat SEO from CMS modules/page meta only.
 *
 * @param props - Route params with retreat slug
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [modulesResult, sitePageResult] = await Promise.all([
    getPageModules(slug).catch(() => null),
    getSitePage(slug).catch(() => null),
  ]);
  return metadataForSlug(
    slug,
    modulesResult?.data?.meta ?? sitePageResult?.data?.meta,
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const retreatResult = await getRetreat(slug);

  if (retreatResult.data) {
    const data = await loadRetreatPageData(retreatResult.data);
    return <RetreatClient {...data} />;
  }

  const result = await getSitePage(slug);
  if (!result.data) notFound();

  const data = await loadSitePageDataAsync(result.data);
  return (
    <LegacyRetreatClient
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
    />
  );
}
