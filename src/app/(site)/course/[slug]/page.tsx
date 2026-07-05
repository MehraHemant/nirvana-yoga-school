import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapSection } from "@/components/home";
import { getResidentialCourse } from "@/content";
import { getSlugsByType } from "@/content/pages";
import { courseMetadata } from "../../_shared/metadata";
import { loadResidentialPageData } from "./data";
import ResidentialClient from "./ResidentialClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getSlugsByType("course");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getResidentialCourse(slug);
  if (!result.data) return { title: "Course Not Found" };

  return courseMetadata(
    result.data.title,
    result.data.subtitle,
    result.data.image,
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const result = await getResidentialCourse(slug);
  if (!result.data) notFound();

  const data = await loadResidentialPageData(slug, result.data);

  return (
    <>
      <ResidentialClient {...data} />
      <MapSection />
    </>
  );
}
