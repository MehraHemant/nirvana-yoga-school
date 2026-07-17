import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapSection } from "@/components/home";
import TeachersPageClient from "@/components/teachers/TeachersPageClient";
import { getSiteMap } from "@/content/repositories/shared-sections";
import { getTeachersPage } from "@/content/repositories/teachers";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { mergePageMetadata } from "../_shared/metadata";

export const revalidate = 3600;

/**
 * Metadata for the faculty page from MySQL, with CMS `page.meta` overrides.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getTeachersPage();
  if (!result.data) return { title: "Teachers" };
  const { page, presentation } = result.data;
  return mergePageMetadata(
    {
      title: page.title,
      description: presentation.heroLead ?? page.description,
      image: page.image,
    },
    page.meta,
  );
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

  const { page, presentation, teachers } = result.data;
  const siteMap = siteMapResult?.data ?? null;
  const showMap = shouldRenderSection(
    siteMap,
    Boolean(siteMap?.embedUrl?.trim()),
  );

  return (
    <>
      <TeachersPageClient
        teachers={teachers}
        heroImage={page.image}
        eyebrow={page.eyebrow || "Our Spiritual Indian Gurus"}
        title={page.title || "Faculty of Nirvana"}
        lead={
          presentation.heroLead ??
          page.description ??
          "Twelve lineage teachers guiding Hatha, Vinyasa, Kundalini, philosophy, anatomy, and meditation on the banks of the Ganga."
        }
        quote={
          presentation.heroQuote ??
          "Yoga Is A Light, Which Once Lit Will Never Dim. The Better Your Practice, The Brighter Your Flame."
        }
        sectionEyebrow={presentation.sectionEyebrow ?? "Faculty profiles"}
        sectionTitle={presentation.sectionTitle ?? "Meet our gurus"}
        sectionDescription={
          presentation.sectionDescription ??
          "Biography, education, experience, and areas of expertise for every member of our faculty."
        }
        heroId={presentation.heroId}
        facultyId={presentation.facultyId}
      />
      {showMap && siteMap ? <MapSection content={siteMap} /> : null}
    </>
  );
}
