import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRetreat, getRetreatSlugs, getSitePage } from "@/content";
import { getPageModules } from "@/content/repositories/page-modules";
import { mergePageMetadata } from "../../_shared/metadata";
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [retreatResult, modulesResult] = await Promise.all([
    getRetreat(slug),
    getPageModules(slug).catch(() => null),
  ]);
  if (retreatResult.data) {
    return mergePageMetadata(
      {
        title: retreatResult.data.title,
        description: retreatResult.data.description,
        image: retreatResult.data.heroImage,
      },
      modulesResult?.data?.meta,
    );
  }

  const result = await getSitePage(slug);
  if (!result.data) return { title: "Retreat Not Found" };

  return mergePageMetadata(
    {
      title: result.data.title,
      description: result.data.description,
      image: result.data.image,
    },
    result.data.meta ?? modulesResult?.data?.meta,
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
