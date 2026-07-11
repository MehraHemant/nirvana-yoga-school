import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSitePage } from "@/content";
import { getSlugsByType, isDedicatedRouteSlug } from "@/content/pages";
import { courseMetadata } from "../_shared/metadata";
import { renderSitePage } from "./_site/render";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getSlugsByType("site")
    .filter((slug) => slug !== "teacher" && slug !== "contact")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "contact" || slug === "teacher") return { title: "Not Found" };
  const result = await getSitePage(slug);
  if (!result.data) return { title: "Page Not Found" };

  return courseMetadata(
    result.data.title,
    result.data.description,
    result.data.image,
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
