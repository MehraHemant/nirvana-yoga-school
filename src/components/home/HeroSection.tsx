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
  /** Visual treatment — `online` uses a light digital band instead of full-bleed video */
  variant?: "default" | "online";
};

/**
 * Homepage full-bleed hero with badge, title, CTA, trust chips, and marquee.
 *
 * @param props - Optional CMS hero fields and layout variant
 */
export default function HeroSection({
  content = createEmptyHomePageContent().hero,
  variant = "default",
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
  const isOnline = variant === "online";

  return (
    <HeroFrame
      id={optionalSectionHtmlId(content._id)}
      transparentHeader={!isOnline}
      className={
        isOnline
          ? "online-hub-hero relative min-h-[85svh] w-full overflow-hidden bg-surface pt-(--site-header-height) text-ink"
          : "relative min-h-svh w-full overflow-hidden bg-primary"
      }
    >
      {isOnline ? (
        <>
          <div
            className="online-hub-hero-wash pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <div
            className="online-hub-hero-glow pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
        </>
      ) : (
        <>
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
        </>
      )}

      <HeroFlourish
        className={`absolute top-28 right-6 md:right-12 w-24 md:w-32 h-24 md:h-32 pointer-events-none ${isOnline ? "text-primary/10" : "text-white/10"}`}
      />

      <div
        className={`relative z-10 flex items-end ${isOnline ? "min-h-[calc(85svh-var(--site-header-height))] pb-28 sm:pb-32 md:pb-36" : "min-h-svh pb-36 sm:pb-[4.5rem] md:pb-[5rem]"}`}
      >
        <Container size="2xl" className="w-full">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7 xl:col-span-8 relative">
              <span
                className={`hidden md:block absolute -left-6 top-2 bottom-2 w-px bg-linear-to-b from-transparent to-transparent ${isOnline ? "via-primary/35" : "via-accent/70"}`}
                aria-hidden="true"
              />

              <div
                className={`animate-fade-up fade-delay-200 inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 sm:gap-2.5 sm:px-4 sm:py-2 sm:mb-6 ${isOnline ? "border border-primary/20 bg-primary/8" : "hero-glass"}`}
              >
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${isOnline ? "bg-primary" : "bg-accent"}`}
                  />
                  <span
                    className={`relative inline-flex h-full w-full rounded-full ${isOnline ? "bg-primary" : "bg-accent"}`}
                  />
                </span>
                <span
                  className={`type-eyebrow ${isOnline ? "text-primary" : "text-white/90"}`}
                >
                  {badge}
                </span>
              </div>

              <Heading
                as="h1"
                align="left"
                invert={!isOnline}
                size="h1"
                className="animate-fade-up fade-delay-300 text-balance"
              >
                {titleLead} <br />
                <div className="relative inline-block whitespace-nowrap">
                  <span
                    className={`font-semibold ${isOnline ? "text-primary" : "text-accent"}`}
                  >
                    {titleAccent}
                  </span>
                  <HeroUnderline
                    className={`absolute -bottom-1 md:-bottom-2 left-0 w-full ${isOnline ? "text-primary" : "text-accent"}`}
                  />
                </div>
                <span className={isOnline ? "text-primary" : "text-accent"}>
                  .
                </span>
              </Heading>

              {supportText ? (
                <p
                  className={`animate-fade-up fade-delay-400 mt-4 max-w-xl text-pretty type-body sm:mt-5 lg:text-[0.9375rem] xl:text-base 2xl:text-lg ${isOnline ? "text-muted" : "text-white/85"}`}
                >
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
                  <Button
                    href={secondaryHref}
                    variant={isOnline ? "secondary" : "outline-light"}
                    responsive
                  >
                    {secondaryLabel}
                  </Button>
                ) : null}
              </div>

              {mobileTrust.length > 0 ? (
                <div className="animate-fade-up fade-delay-600 lg:hidden mt-5 sm:mt-8 flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                  {mobileTrust.map((item) => (
                    <div
                      key={item.label}
                      className={`shrink-0 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[76px] sm:min-w-[88px] text-center ${isOnline ? "border border-ink/8 bg-surface-muted" : "hero-glass"}`}
                    >
                      <div
                        className={`type-display-sm font-semibold leading-none ${isOnline ? "text-ink" : "text-white"}`}
                      >
                        {item.value}
                      </div>
                      <div
                        className={`type-eyebrow mt-1 ${isOnline ? "text-muted" : "text-white/60"}`}
                      >
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
        <div
          className={`absolute bottom-0 inset-x-0 z-10 border-t backdrop-blur-md ${isOnline ? "border-ink/8 bg-surface/90" : "border-white/10 bg-black/55"}`}
        >
          <div className="marquee-mask overflow-hidden py-3">
            <div className="flex w-max animate-marquee" aria-hidden="true">
              {["a", "b"].map((set) => (
                <div key={set} className="flex">
                  {marqueeItems.map((item) => (
                    <div
                      key={`${set}-${item}`}
                      className={`flex items-center gap-5 md:gap-10 px-5 md:px-10 text-xs md:text-sm whitespace-nowrap ${isOnline ? "text-ink/70" : "text-white/75"}`}
                    >
                      <span className="tracking-wide">{item}</span>
                      <span
                        className={`w-1 h-1 rounded-full ${isOnline ? "bg-primary/60" : "bg-accent/70"}`}
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
