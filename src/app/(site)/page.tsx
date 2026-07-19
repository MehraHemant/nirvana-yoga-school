import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { HeroSection, JsonLd, WelcomeSection } from "@/components";
import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import { getHomePageContent } from "@/content/repositories/dedicated-pages";
import { getSiteMap } from "@/content/repositories/shared-sections";
import { getTeachersPage } from "@/content/repositories/teachers";
import { shouldRenderHomeSection } from "@/lib/cms/home-section-visibility";
import { shouldRenderSection } from "@/lib/cms/section-visibility";
import { resolveSectionHtmlId } from "@/lib/html-id";
import { metadataFromPageSeo } from "./_shared/metadata";

/** Align Full Route Cache with content `unstable_cache` TTL */
export const revalidate = 3600;

/**
 * Homepage SEO from dedicated CMS meta, falling back to root defaults.
 */
export async function generateMetadata(): Promise<Metadata> {
  const homeResult = await getHomePageContent().catch(() => null);
  return metadataFromPageSeo(homeResult?.data?.meta);
}

const VideoSection = dynamic(() => import("@/components/home/VideoSection"));
const GallerySection = dynamic(
  () => import("@/components/home/GallerySection"),
);
const WhyRishikeshSection = dynamic(
  () => import("@/components/home/WhyRishikeshSection"),
);
const CoursesSection = dynamic(
  () => import("@/components/home/CoursesSection"),
);
const YogaAllianceSection = dynamic(
  () => import("@/components/home/YogaAllianceSection"),
);
const TeachersSection = dynamic(
  () => import("@/components/home/TeachersSection"),
);
const TestimonialsSection = dynamic(
  () => import("@/components/home/TestimonialsSection"),
);
const MapSection = dynamic(() => import("@/components/home/MapSection"));
const FAQSection = dynamic(() =>
  import("@/components/ui/FAQSection").then((m) => m.default),
);
const FinalCTASection = dynamic(
  () => import("@/components/home/FinalCTASection"),
);

/** Lightweight placeholder so layout doesn’t jump while a section chunk loads. */
function SectionSkeleton({
  minHeight = "min-h-[40vh]",
}: {
  minHeight?: string;
}) {
  return <div className={`w-full ${minHeight}`} aria-hidden="true" />;
}

/**
 * Builds homepage JSON-LD from CMS FAQs and optional SEO fields.
 *
 * @param home - Normalized homepage CMS document
 */
function buildHomeJsonLd(home: typeof DEFAULT_HOME_PAGE_CONTENT) {
  const sameAs = home.seo?.organization?.sameAs?.length
    ? home.seo.organization.sameAs
    : (DEFAULT_HOME_PAGE_CONTENT.seo?.organization?.sameAs ?? []);
  const lb = {
    ...DEFAULT_HOME_PAGE_CONTENT.seo?.localBusiness,
    ...home.seo?.localBusiness,
  };
  const faqs = home.faqs.faqs.length
    ? home.faqs.faqs
    : DEFAULT_HOME_PAGE_CONTENT.faqs.faqs;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.nirvanayogaschoolindia.com/#org",
        name: "Nirvana Yoga School",
        url: "https://www.nirvanayogaschoolindia.com",
        logo: "https://www.nirvanayogaschoolindia.com/logo.png",
        sameAs,
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://www.nirvanayogaschoolindia.com/#school",
        name: "Nirvana Yoga School",
        image: "https://www.nirvanayogaschoolindia.com/logo.png",
        priceRange: lb.priceRange,
        address: {
          "@type": "PostalAddress",
          streetAddress: lb.streetAddress,
          addressLocality: lb.addressLocality,
          addressRegion: lb.addressRegion,
          postalCode: lb.postalCode,
          addressCountry: lb.addressCountry,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: lb.ratingValue,
          reviewCount: lb.reviewCount,
          bestRating: "5",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

/**
 * Homepage — hero + welcome load immediately; below-fold sections are code-split.
 */
export default async function Home() {
  const [homeResult, teachersResult, siteMapResult] = await Promise.all([
    getHomePageContent().catch(() => null),
    getTeachersPage(),
    getSiteMap().catch(() => null),
  ]);
  const home = homeResult?.data ?? DEFAULT_HOME_PAGE_CONTENT;
  const teachers = teachersResult.data?.teachers ?? [];
  const siteMap = siteMapResult?.data ?? null;
  const heroVideo = home.hero.video;
  const jsonLd = buildHomeJsonLd(home);
  const showMap =
    shouldRenderHomeSection("map", home) &&
    shouldRenderSection(siteMap, Boolean(siteMap?.embedUrl?.trim()));

  return (
    <>
      {/* Hero LCP — poster only; video loads after paint */}
      <link
        rel="preload"
        as="image"
        href={heroVideo.mobilePoster}
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={heroVideo.desktopPoster}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <JsonLd data={jsonLd} />
      {shouldRenderHomeSection("hero", home) ? (
        <HeroSection content={home.hero} />
      ) : null}
      {shouldRenderHomeSection("welcome", home) ? (
        <WelcomeSection content={home.welcome} />
      ) : null}
      {shouldRenderHomeSection("video", home) ? (
        <Suspense fallback={<SectionSkeleton minHeight="min-h-[50vh]" />}>
          <VideoSection content={home.video} />
        </Suspense>
      ) : null}
      {shouldRenderHomeSection("gallery", home) ? (
        <GallerySection content={home.gallery} />
      ) : null}
      {shouldRenderHomeSection("whyRishikesh", home) ? (
        <Suspense fallback={<SectionSkeleton minHeight="min-h-[50vh]" />}>
          <WhyRishikeshSection content={home.whyRishikesh} />
        </Suspense>
      ) : null}
      {shouldRenderHomeSection("courses", home) ? (
        <CoursesSection content={home.courses} />
      ) : null}
      {shouldRenderHomeSection("yogaAlliance", home) ? (
        <YogaAllianceSection content={home.yogaAlliance} />
      ) : null}
      {shouldRenderHomeSection("teachersTeaser", home) ? (
        <TeachersSection
          teachers={teachers}
          eyebrow={home.teachersTeaser.eyebrow}
          title={home.teachersTeaser.title}
          description={home.teachersTeaser.description}
          ctaLabel={home.teachersTeaser.ctaLabel}
          ctaHref={home.teachersTeaser.ctaHref}
          sectionId={home.teachersTeaser._id}
        />
      ) : null}
      {shouldRenderHomeSection("testimonials", home) ? (
        <TestimonialsSection
          reviews={
            home.testimonials.reviews?.length
              ? { reviews: home.testimonials.reviews }
              : null
          }
          content={{
            _id: home.testimonials._id,
            eyebrow: home.testimonials.eyebrow,
            title: home.testimonials.title,
            description: home.testimonials.description,
          }}
        />
      ) : null}
      {showMap && siteMap ? (
        <MapSection
          content={siteMap}
          htmlId={resolveSectionHtmlId("location", home.map._id)}
        />
      ) : null}
      {shouldRenderHomeSection("faqs", home) ? (
        <FAQSection
          id={resolveSectionHtmlId("faq", home.faqs._id)}
          faqs={home.faqs.faqs}
          eyebrow={home.faqs.eyebrow}
          title={home.faqs.title}
          sectionClassName="bg-white"
        />
      ) : null}
      {shouldRenderHomeSection("finalCta", home) ? (
        <FinalCTASection content={home.finalCta} />
      ) : null}
    </>
  );
}
