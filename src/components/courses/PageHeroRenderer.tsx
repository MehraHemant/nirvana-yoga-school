"use client";

import Image from "next/image";
import CourseHero from "@/components/courses/CourseHero";
import OnlineCourseHero from "@/components/online/OnlineCourseHero";
import { Button, Container, Heading } from "@/components/ui";
import { extractMediaFromModules } from "@/content/mappers/page-modules";
import type { PageModulesDocument } from "@/content/types";
import { cmsImageUrl } from "@/content/types/cms-image";

type PageHeroRendererProps = {
  modules: PageModulesDocument;
};

/**
 * Renders the correct hero layout based on module hero type.
 *
 * @param props - Page modules document
 */
export default function PageHeroRenderer({ modules }: PageHeroRendererProps) {
  const hero = modules.hero;
  const media = extractMediaFromModules(modules);

  if (hero.type === "split-copy") {
    const previewVideoId =
      hero.previewType === "video" ? hero.previewUrl : undefined;
    const duration =
      hero.metaItems?.find((m) => m.label === "Duration")?.value ?? "";
    const level = hero.metaItems?.find((m) => m.label === "Level")?.value ?? "";
    const certification =
      hero.metaItems?.find((m) => m.label === "Certification")?.value ?? "";
    const fee = hero.metaItems?.find((m) => m.label === "Fee")?.value ?? "";

    return (
      <OnlineCourseHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle ?? ""}
        duration={duration}
        level={level}
        certification={certification}
        fee={fee}
        image={hero.previewType === "image" ? hero.previewUrl : undefined}
        previewVideoId={previewVideoId}
        ctaPrimary={hero.ctaPrimary ?? ""}
        ctaPrimaryHref={hero.ctaPrimaryHref ?? ""}
        ctaSecondary={hero.ctaSecondary ?? ""}
        ctaSecondaryHref={hero.ctaSecondaryHref ?? ""}
      />
    );
  }

  if (hero.type === "simple-banner") {
    return (
      <section
        data-transparent-header="true"
        className="relative h-[60svh] min-h-[420px] overflow-hidden"
      >
        <Image
          src={hero.backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/40 to-transparent" />
        <Container
          size="xl"
          className="relative z-10 flex h-full items-end pb-12"
        >
          <div className="max-w-3xl space-y-4 text-white">
            <Heading as="h1" size="h1" invert>
              {hero.title}
            </Heading>
            {hero.subtitle ? (
              <p className="type-lead text-white/85">{hero.subtitle}</p>
            ) : null}
            {hero.ctaLabel && hero.ctaHref ? (
              <Button href={hero.ctaHref} variant="primary" size="lg">
                {hero.ctaLabel}
              </Button>
            ) : null}
          </div>
        </Container>
      </section>
    );
  }

  if (hero.type === "page-minimal") {
    return (
      <section className="relative overflow-hidden bg-sand pt-[var(--site-header-height)]">
        <Container size="xl" className="py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              {hero.eyebrow ? (
                <p className="type-eyebrow text-primary">{hero.eyebrow}</p>
              ) : null}
              <Heading as="h1" size="h1">
                {hero.title}
              </Heading>
              {hero.subtitle ? (
                <p className="type-lead text-muted">{hero.subtitle}</p>
              ) : null}
              {hero.description ? (
                <p className="type-body text-muted">{hero.description}</p>
              ) : null}
              {hero.ctaLabel && hero.ctaHref ? (
                <Button href={hero.ctaHref} variant="primary">
                  {hero.ctaLabel}
                </Button>
              ) : null}
            </div>
            {hero.heroImage ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src={hero.heroImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : null}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <CourseHero
      title={hero.title}
      subtitle={hero.subtitle}
      duration={hero.duration}
      level={hero.level}
      certification={hero.certification}
      fee={hero.fee}
      image={cmsImageUrl(hero.heroImages?.[0] ?? "")}
      certBadge={hero.certBadge}
      heroImages={hero.heroImages}
      imageDetails={hero.imageDetails ?? media.imageDetails}
      videos={hero.videos ?? media.videos}
    />
  );
}
