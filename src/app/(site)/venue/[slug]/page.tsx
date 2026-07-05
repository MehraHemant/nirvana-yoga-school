import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapSection } from "@/components/home";
import { getSlugsByType } from "@/content/pages";
import { getSitePage } from "@/content";
import { courseMetadata } from "../../_shared/metadata";
import { loadSitePageData } from "../../_shared/site/data";
import VenueClient from "./VenueClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getSlugsByType("venue").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSitePage(slug);
  if (!result.data) return { title: "Venue Not Found" };

  return courseMetadata(
    result.data.title,
    result.data.description,
    result.data.image,
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const result = await getSitePage(slug);
  if (!result.data) notFound();

  const data = loadSitePageData(result.data);
  const props = {
    page: data.page,
    mapped: data.mapped,
    teachers: data.teachers,
  };

  return (
    <>
      <VenueClient {...props} />
      <MapSection />
    </>
  );
}
