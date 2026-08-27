import Image from "next/image";
import { HeroFrame } from "@/components/hero";
import { Button, Container } from "@/components/ui";
import { ArrowRight } from "@/icons";

/** Fallback still when the journal has no cover image yet. */
const JOURNAL_HERO_FALLBACK = "/videos/videodesktop-poster.webp";

type BlogIndexHeroProps = {
  /** Optional cover from the latest CMS post (Photo Soft Grid). */
  imageSrc?: string | null;
};

/**
 * Full-bleed photo hero for the journal index (Photo Soft Grid).
 *
 * @param props - Optional CMS cover image
 */
export function BlogIndexHero({ imageSrc }: BlogIndexHeroProps) {
  const src = imageSrc?.trim() || JOURNAL_HERO_FALLBACK;

  return (
    <HeroFrame
      transparentHeader
      className="relative isolate min-h-[min(48svh,26rem)] overflow-hidden bg-ink text-white sm:min-h-[min(52svh,30rem)]"
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

      <div className="relative z-10 flex min-h-[min(48svh,26rem)] items-end px-5 pb-10 pt-[calc(var(--site-header-height)+1.25rem)] sm:min-h-[min(52svh,30rem)] sm:px-8 sm:pb-12 lg:pb-14">
        <Container size="2xl" className="w-full">
          <div className="max-w-lg text-white">
            <p className="animate-fade-up text-lg font-semibold sm:text-xl">
              Nirvana Yoga School
            </p>
            <h1 className="animate-fade-up fade-delay-100 mt-2 text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              The Journal
            </h1>
            <p className="animate-fade-up fade-delay-200 mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
              Essays from the Himalayan school — practice, philosophy, teaching.
            </p>
            <div className="animate-fade-up fade-delay-300 mt-6">
              <Button
                href="#journal"
                variant="outline-light"
                size="md"
                className="group"
              >
                Browse essays
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
