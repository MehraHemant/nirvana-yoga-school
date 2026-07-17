import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSitePage, getSitePageSlugs } from "@/content";
import { isDedicatedRouteSlug } from "@/content/pages";
import { getYttHub } from "@/content/repositories/shared-sections";
import type { PageSeoMeta } from "@/content/types/page-seo";
import { mergePageMetadata } from "../_shared/metadata";
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
 * Site page SEO — merges product/page fallbacks with CMS `meta`.
 * YTT hub also merges `yttHub.meta` (hub fields win when set).
 *
 * @param props - Route params with page slug
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "contact" || slug === "teacher") return { title: "Not Found" };
  const result = await getSitePage(slug);
  if (!result.data) return { title: "Page Not Found" };

  const page = result.data;
  let meta: PageSeoMeta | undefined = page.meta;

  if (slug === YTT_HUB_SLUG) {
    const hubResult = await getYttHub().catch(() => null);
    const hubMeta = hubResult?.data?.meta;
    if (hubMeta || page.meta) {
      meta = { ...page.meta, ...hubMeta };
    }
  }

  return mergePageMetadata(
    {
      title: page.title,
      description: page.description,
      image: page.image,
    },
    meta,
  );
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
