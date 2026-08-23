import Image from "next/image";
import Link from "next/link";
import { HeroFrame } from "@/components/hero";
import { Container } from "@/components/ui";
import type { BlogPostDocument } from "@/content/types";

type BlogPostHeroProps = {
  post: BlogPostDocument;
};

/**
 * Formats the article publication date for display.
 *
 * @param value - ISO publication date from the CMS
 */
function formatPublishedDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Immersive full-bleed editorial hero for an individual journal article.
 *
 * @param props - Published blog post
 */
export function BlogPostHero({ post }: BlogPostHeroProps) {
  const publishedDate = formatPublishedDate(post.publishedAt);

  return (
    <HeroFrame
      transparentHeader
      className="relative min-h-[70svh] overflow-hidden bg-ink text-white sm:min-h-[74svh] lg:min-h-[82svh]"
    >
      <Image
        src={post.image}
        alt={post.title}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center animate-hero-zoom"
      />

      <div
        className="absolute inset-0 bg-linear-to-t from-ink via-ink/58 to-ink/18"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-linear-to-r from-ink/82 via-ink/32 to-ink/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-36 bg-linear-to-b from-ink/68 to-transparent sm:h-44"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-[58%] w-[58%] opacity-40 hero-glow"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[70svh] items-end pb-12 pt-[calc(var(--site-header-height)+2rem)] sm:min-h-[74svh] sm:pb-16 lg:min-h-[82svh] lg:pb-20">
        <Container size="2xl" className="w-full">
          <div className="max-w-4xl">
            <div className="animate-fade-up fade-delay-100 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href="/blog"
                className="type-eyebrow text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Nirvana Journal
              </Link>
              <span className="h-px w-6 bg-primary" aria-hidden="true" />
              <p className="type-eyebrow text-white/55">{post.category}</p>
              {publishedDate ? (
                <>
                  <span className="h-px w-6 bg-white/20" aria-hidden="true" />
                  <time
                    dateTime={post.publishedAt ?? undefined}
                    className="text-xs tracking-wide text-white/55 sm:text-sm"
                  >
                    {publishedDate}
                  </time>
                </>
              ) : null}
            </div>

            <h1 className="animate-fade-up fade-delay-200 mt-7 max-w-4xl text-balance text-[clamp(2.35rem,5.6vw,4.4rem)] font-bold leading-[1.04] tracking-tight text-white sm:mt-8">
              {post.title}
            </h1>

            <p className="animate-fade-up fade-delay-300 mt-6 max-w-2xl text-pretty text-[clamp(1.15rem,2vw,1.4rem)] font-semibold leading-snug tracking-[-0.01em] text-white/82 sm:mt-7">
              {post.excerpt}
            </p>
          </div>
        </Container>
      </div>
    </HeroFrame>
  );
}
