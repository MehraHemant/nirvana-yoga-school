import { HeroFrame } from "@/components/hero";
import { Button, Container } from "@/components/ui";
import Image from "@/components/ui/CdnImage";
import { ArrowRight } from "@/icons";

/** Fallback still when the journal has no cover image yet. */
const JOURNAL_HERO_FALLBACK = "/videos/videodesktop-poster.webp";

type BlogIndexHeroProps = {
  /** Hero image: CMS `/admin/pages/blog` hero, else latest post cover. */
  imageSrc?: string | null;
  /** Small line above the title. */
  eyebrow?: string;
  /** Main heading. */
  title?: string;
  /** Supporting line under the heading. */
  subtitle?: string;
  /** Button label. */
  ctaLabel?: string;
  /** Button target. */
  ctaHref?: string;
};

/**
 * Full-bleed photo hero for the journal index (Photo Soft Grid).
 *
 * @param props - Optional CMS cover image
 */
export function BlogIndexHero({
  imageSrc,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: BlogIndexHeroProps) {
  const src = imageSrc?.trim() || JOURNAL_HERO_FALLBACK;
  const eyebrowText = eyebrow?.trim() || "Nirvana Yoga School";
  const titleText = title?.trim() || "The Journal";
  const subtitleText =
    subtitle?.trim() ||
    "Essays from the Himalayan school — practice, philosophy, teaching.";
  const buttonLabel = ctaLabel?.trim() || "Browse essays";
  const buttonHref = ctaHref?.trim() || "#journal";

  return (
    <HeroFrame
      transparentHeader
      className="relative isolate min-h-[60svh] overflow-hidden bg-ink text-white lg:min-h-[66svh]"
    >
      <Image
        src={src}
        alt="Morning practice overlooking the Himalayas at Nirvana Yoga School"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%] opacity-90 animate-hero-zoom"
      />

      <div
        className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/30 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[60svh] items-end px-5 pb-12 pt-[calc(var(--site-header-height)+3rem)] sm:px-8 sm:pb-14 lg:min-h-[66svh] lg:pb-16">
        <Container size="2xl" className="w-full">
          <div className="max-w-lg text-white">
            <p className="animate-fade-up text-lg font-semibold sm:text-xl">
              {eyebrowText}
            </p>
            <h1 className="animate-fade-up fade-delay-100 mt-2 text-[clamp(1.75rem,4vw,2.875rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
              {titleText}
            </h1>
            <p className="animate-fade-up fade-delay-200 mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
              {subtitleText}
            </p>
            <div className="animate-fade-up fade-delay-300 mt-6">
              <Button
                href={buttonHref}
                variant="outline-light"
                size="md"
                className="group"
              >
                {buttonLabel}
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </HeroFrame>
  );
}
