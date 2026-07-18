import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapSection } from "@/components/home";
import { getSitePage } from "@/content";
import { fetchPageSlugsByTypeFromDb } from "@/lib/cms/cache";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { mergePageMetadata } from "../../_shared/metadata";
import { loadSitePageDataAsync } from "../../_shared/site/data.server";
import VenueClient from "./VenueClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Build static paths from published venue slugs in MySQL.
 */
export async function generateStaticParams() {
  const slugs = await fetchPageSlugsByTypeFromDb("venue");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSitePage(slug);
  if (!result.data) return { title: "Venue Not Found" };

  return mergePageMetadata(
    {
      title: result.data.title,
      description: result.data.description,
      image: result.data.image,
    },
    result.data.meta,
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const result = await getSitePage(slug);
  if (!result.data) notFound();

  const data = await loadSitePageDataAsync(result.data);
  const props = {
    page: data.page,
    mapped: data.mapped,
    teachers: data.teachers,
    modules: data.modules,
    residentialLife: data.residentialLife,
    whyNirvana: data.whyNirvana,
    reviews: data.reviews,
    siteMap: data.siteMap,
    instagram: data.instagram,
    travel: data.travel,
  };

  const showMap =
    (data.modules?.flags.showMap ?? data.mapped.showMap) &&
    shouldRenderSection(
      data.siteMap,
      Boolean(data.siteMap?.embedUrl?.trim()),
    );

  return (
    <>
      <VenueClient {...props} />
      {showMap && data.siteMap ? <MapSection content={data.siteMap} /> : null}
    </>
  );
}
