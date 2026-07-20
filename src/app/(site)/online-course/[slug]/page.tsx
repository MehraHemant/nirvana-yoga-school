import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOnlineCourse, getOnlineCourseSlugs } from "@/content";
import { getPageModules } from "@/content/repositories/page-modules";
import { metadataFromPageSeo } from "../../_shared/metadata";
import { loadOnlineCoursePageData } from "./data";
import OnlineCourseClient from "./OnlineCourseClient";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Build static paths from published online course slugs in MySQL.
 */
export async function generateStaticParams() {
  const slugs = await getOnlineCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Online course SEO from CMS page modules meta only.
 *
 * @param props - Route params with course slug
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const modulesResult = await getPageModules(slug).catch(() => null);
  return metadataFromPageSeo(modulesResult?.data?.meta);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const result = await getOnlineCourse(slug);
  if (!result.data) notFound();

  const data = await loadOnlineCoursePageData(slug, result.data);
  return <OnlineCourseClient {...data} />;
}
