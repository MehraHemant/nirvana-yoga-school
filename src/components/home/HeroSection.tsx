import { HeroFrame } from "@/components/hero";
import { Button, Container, Heading } from "@/components/ui";
import type { HomeHeroContent } from "@/content/types/dedicated-pages";
import { ArrowRight, HeroFlourish, HeroUnderline } from "@/icons";
import { createEmptyHomePageContent } from "@/lib/cms/structural-defaults";
import { optionalSectionHtmlId } from "@/lib/html-id";
import HeroBackgroundVideo from "./HeroBackgroundVideo";

type HeroSectionProps = {
  /** Optional CMS hero content; falls back to defaults */
  content?: HomeHeroContent;
};

/**
 * Homepage full-bleed hero with badge, title, CTA, trust chips, and marquee.
 *
 * @param props - Optional CMS hero fields
 */
export default function HeroSection({
  content = createEmptyHomePageContent().hero,
}: HeroSectionProps) {
  const {
    badge,
    titleLead,
    titleAccent,
    support,
    ctaLabel,
    ctaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
    marqueeItems,
    mobileTrust,
    video,
  } = content;
  const supportText = support?.trim() || "";
  const secondaryLabel = secondaryCtaLabel?.trim() || "";
  const secondaryHref = secondaryCtaHref?.trim() || "";
  const showSecondary = Boolean(secondaryLabel && secondaryHref);

  return (
    <HeroFrame
      id={optionalSectionHtmlId(content._id)}
      transparentHeader
      className="relative min-h-svh w-full overflow-hidden bg-primary"
    >
      <HeroBackgroundVideo video={video} />

      <div
        className="absolute inset-0 bg-linear-to-t from-black/92 via-black/40 via-50% to-black/20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/55 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hero-glow pointer-events-none"
        aria-hidden="true"
      />

      <HeroFlourish className="absolute top-28 right-6 md:right-12 w-24 md:w-32 h-24 md:h-32 text-white/10 pointer-events-none" />

      <div className="relative z-10 min-h-svh flex items-end pb-36 sm:pb-[4.5rem] md:pb-[5rem]">
        <Container size="2xl" className="w-full">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7 xl:col-span-8 relative">
              <span
                className="hidden md:block absolute -left-6 top-2 bottom-2 w-px bg-linear-to-b from-transparent via-accent/70 to-transparent"
                aria-hidden="true"
              />

              <div className="animate-fade-up fade-delay-200 inline-flex items-center gap-2 hero-glass rounded-full px-3 py-1.5 mb-4 sm:gap-2.5 sm:px-4 sm:py-2 sm:mb-6">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-full w-full rounded-full bg-accent" />
                </span>
                <span className="type-eyebrow text-white/90">{badge}</span>
              </div>

              <Heading
                as="h1"
                align="left"
                invert
                size="h1"
                className="animate-fade-up fade-delay-300 text-balance"
              >
                {titleLead} <br />
                <div className="relative inline-block whitespace-nowrap">
                  <span className="font-serif font-normal text-accent">
                    {titleAccent}
                  </span>
                  <HeroUnderline className="absolute -bottom-1 md:-bottom-2 left-0 w-full text-accent" />
                </div>
                <span className="text-accent">.</span>
              </Heading>

              {supportText ? (
                <p className="animate-fade-up fade-delay-400 mt-4 max-w-xl text-pretty type-body text-white/85 sm:mt-5 sm:text-lg">
                  {supportText}
                </p>
              ) : null}

              <div className="animate-fade-up fade-delay-500 mt-5 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                <Button
                  href={ctaHref}
                  variant="primary"
                  responsive
                  className="group shadow-lg shadow-primary/30 hover:shadow-primary/40"
                >
                  {ctaLabel}
                  <ArrowRight
                    size={16}
                    className="sm:w-[18px] sm:h-[18px] transition-transform group-hover:translate-x-1"
                  />
                </Button>
                {showSecondary ? (
                  <Button href={secondaryHref} variant="outline-light" responsive>
                    {secondaryLabel}
                  </Button>
                ) : null}
              </div>

              {mobileTrust.length > 0 ? (
                <div className="animate-fade-up fade-delay-600 lg:hidden mt-5 sm:mt-8 flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                  {mobileTrust.map((item) => (
                    <div
                      key={item.label}
                      className="hero-glass shrink-0 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[76px] sm:min-w-[88px] text-center"
                    >
                      <div className="type-display-sm font-semibold text-white leading-none">
                        {item.value}
                      </div>
                      <div className="type-eyebrow text-white/60 mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </div>

      {marqueeItems.length > 0 ? (
        <div className="absolute bottom-0 inset-x-0 z-10 border-t border-white/10 bg-black/55 backdrop-blur-md">
          <div className="marquee-mask overflow-hidden py-3">
            <div className="flex w-max animate-marquee" aria-hidden="true">
              {["a", "b"].map((set) => (
                <div key={set} className="flex">
                  {marqueeItems.map((item) => (
                    <div
                      key={`${set}-${item}`}
                      className="flex items-center gap-5 md:gap-10 px-5 md:px-10 text-white/75 text-xs md:text-sm whitespace-nowrap"
                    >
                      <span className="font-sans tracking-wide">{item}</span>
                      <span
                        className="w-1 h-1 rounded-full bg-accent/70"
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </HeroFrame>
  );
}
