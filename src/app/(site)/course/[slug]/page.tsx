import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResidentialCourse, getResidentialCourseSlugs } from "@/content";
import { getPageModules } from "@/content/repositories/page-modules";
import { cmsImageUrl } from "@/content/types/cms-image";
import {
  CLOUDINARY_HERO_MAIN_WIDTH,
  cloudinaryHeroUrl,
} from "@/lib/cdn/cloudinary-thumb-url";
import { isSectionLive } from "@/lib/cms/section-visibility";
import { metadataFromPageSeo } from "../../_shared/metadata";
import CourseClient from "./CourseClient";
import { loadCoursePageData } from "./data";
import type { CoursePageData } from "./types";

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

/**
 * Course SEO from CMS page modules meta only.
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

/**
 * First gallery-hero Cloudinary URL for document-head LCP preload.
 * Must match `photoSrc` / `HERO_MAIN_WIDTH` on the main stage (`unoptimized`).
 *
 * @param data - Server-loaded course page data
 */
function courseHeroLcpUrl(data: CoursePageData): string | undefined {
  if (data.modules && !isSectionLive(data.modules.hero)) return undefined;

  const hero = data.modules?.hero;
  const first =
    hero?.type === "bento-media"
      ? hero.heroImages?.[0]
      : data.modules
        ? undefined
        : data.course.heroImages?.[0];
  const raw = cmsImageUrl(first ?? "");
  if (!raw) return undefined;
  return cloudinaryHeroUrl(raw, CLOUDINARY_HERO_MAIN_WIDTH);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const result = await getResidentialCourse(slug);
  if (!result.data) notFound();

  const data = await loadCoursePageData(slug, result.data);
  const heroLcpUrl = courseHeroLcpUrl(data);

  return (
    <>
      {heroLcpUrl ? (
        <link
          rel="preload"
          as="image"
          href={heroLcpUrl}
          fetchPriority="high"
        />
      ) : null}
      <CourseClient {...data} />
    </>
  );
}
