import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResidentialCourse, getResidentialCourseSlugs } from "@/content";
import { getPageModules } from "@/content/repositories/page-modules";
import { mergePageMetadata } from "../../_shared/metadata";
import CourseClient from "./CourseClient";
import { loadCoursePageData } from "./data";

/** Align Full Route Cache with content `unstable_cache` TTL */
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Build static paths from published course slugs in MySQL.
 */
export async function generateStaticParams() {
  const slugs = await getResidentialCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [result, modulesResult] = await Promise.all([
    getResidentialCourse(slug),
    getPageModules(slug).catch(() => null),
  ]);
  if (!result.data) return { title: "Course Not Found" };

  return mergePageMetadata(
    {
      title: result.data.title,
      description: result.data.subtitle,
      image: result.data.image,
    },
    modulesResult?.data?.meta,
  );
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const result = await getResidentialCourse(slug);
  if (!result.data) notFound();

  const data = await loadCoursePageData(slug, result.data);

  return <CourseClient {...data} />;
}
