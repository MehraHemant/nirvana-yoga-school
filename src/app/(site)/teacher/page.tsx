import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapSection } from "@/components/home";
import TeachersPageClient from "@/components/teachers/TeachersPageClient";
import { getSiteMap } from "@/content/repositories/shared-sections";
import { getTeachersPage } from "@/content/repositories/teachers";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { metadataForSlug } from "../_shared/metadata";

export const revalidate = 3600;

/**
 * Teachers page SEO from CMS `page.meta` only.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getTeachersPage();
  return metadataForSlug("teacher", result.data?.page.meta);
}

/**
 * Faculty page — profiles and hero copy from the `teacher` page in MySQL.
 */
export default async function TeachersPage() {
  const [result, siteMapResult] = await Promise.all([
    getTeachersPage(),
    getSiteMap().catch(() => null),
  ]);
  if (!result.data) notFound();

  const { presentation, teachers } = result.data;
  const siteMap = siteMapResult?.data ?? null;
  const showMap = shouldRenderSection(
    siteMap,
    Boolean(siteMap?.embedUrl?.trim()),
  );

  return (
    <>
      <TeachersPageClient
        teachers={teachers}
        sectionEyebrow={presentation.sectionEyebrow ?? "Faculty profiles"}
        sectionTitle={presentation.sectionTitle ?? "Meet our gurus"}
        sectionDescription={
          presentation.sectionDescription ??
          "Biography, education, experience, and areas of expertise for every member of our faculty."
        }
        facultyId={presentation.facultyId}
      />
      {showMap && siteMap ? <MapSection content={siteMap} /> : null}
    </>
  );
}
