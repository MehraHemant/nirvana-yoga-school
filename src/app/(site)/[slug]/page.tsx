import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSitePage, getSitePageSlugs } from "@/content";
import { isDedicatedRouteSlug } from "@/content/pages";
import { getPageModules } from "@/content/repositories/page-modules";
import { getYttHub } from "@/content/repositories/shared-sections";
import type { PageSeoMeta } from "@/content/types/page-seo";
import { metadataFromPageSeo } from "../_shared/metadata";
import { renderSitePage } from "./_site/render";

const YTT_HUB_SLUG = "yoga-teacher-training-in-rishikesh-india";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Build static paths from published site page slugs in MySQL.
 */
export async function generateStaticParams() {
  const slugs = await getSitePageSlugs();
  return slugs
    .filter(
      (slug) =>
        slug !== "teacher" && slug !== "contact" && !isDedicatedRouteSlug(slug),
    )
    .map((slug) => ({ slug }));
}

/**
 * Site page SEO from CMS meta only (modules → page → YTT hub).
 *
 * @param props - Route params with page slug
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "contact" || slug === "teacher") return {};

  const [pageResult, modulesResult] = await Promise.all([
    getSitePage(slug).catch(() => null),
    getPageModules(slug).catch(() => null),
  ]);

  let meta: PageSeoMeta | undefined =
    modulesResult?.data?.meta ?? pageResult?.data?.meta;

  if (slug === YTT_HUB_SLUG) {
    const hubResult = await getYttHub().catch(() => null);
    const hubMeta = hubResult?.data?.meta;
    if (hubMeta || meta) {
      meta = { ...meta, ...hubMeta };
    }
  }

  return metadataFromPageSeo(meta);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  if (isDedicatedRouteSlug(slug) || slug === "contact" || slug === "teacher") {
    notFound();
  }

  const result = await getSitePage(slug);
  if (!result.data) notFound();

  return renderSitePage(result.data);
}
