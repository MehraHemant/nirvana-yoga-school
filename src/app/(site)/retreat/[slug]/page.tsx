import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSitePage } from "@/content";
import { getSlugsByType } from "@/content/pages";
import { getRetreat } from "@/content/repositories/retreat";
import { courseMetadata } from "../../_shared/metadata";
import { loadSitePageData } from "../../_shared/site/data";
import { loadRetreatPageData } from "./data";
import LegacyRetreatClient from "./LegacyRetreatClient";
import RetreatClient from "./RetreatClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getSlugsByType("retreat").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const retreatResult = await getRetreat(slug);
  if (retreatResult.data) {
    return courseMetadata(
      retreatResult.data.title,
      retreatResult.data.description,
      retreatResult.data.heroImage,
    );
  }

  const result = await getSitePage(slug);
  if (!result.data) return { title: "Retreat Not Found" };

  return courseMetadata(
    result.data.title,
    result.data.description,
    result.data.image,
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const retreatResult = await getRetreat(slug);

  if (retreatResult.data) {
    const data = loadRetreatPageData(retreatResult.data);
    return <RetreatClient {...data} />;
  }

  const result = await getSitePage(slug);
  if (!result.data) notFound();

  const data = loadSitePageData(result.data);
  return (
    <LegacyRetreatClient
      page={data.page}
      mapped={data.mapped}
      teachers={data.teachers}
    />
  );
}
