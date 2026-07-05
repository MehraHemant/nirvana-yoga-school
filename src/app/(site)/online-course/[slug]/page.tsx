import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOnlineCourse } from "@/content";
import { getSlugsByType } from "@/content/pages";
import { courseMetadata } from "../../_shared/metadata";
import { loadOnlineCoursePageData } from "./data";
import OnlineCourseClient from "./OnlineCourseClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getSlugsByType("online").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getOnlineCourse(slug);
  if (!result.data) return { title: "Course Not Found" };

  return courseMetadata(
    result.data.title,
    result.data.subtitle,
    result.data.image,
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const result = await getOnlineCourse(slug);
  if (!result.data) notFound();

  const data = await loadOnlineCoursePageData(slug, result.data);
  return <OnlineCourseClient {...data} />;
}
