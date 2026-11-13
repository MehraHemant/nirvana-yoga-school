import type { Metadata } from "next";
import { BlogIndexEmpty } from "@/components/blog/BlogIndexEmpty";
import { BlogIndexHero } from "@/components/blog/BlogIndexHero";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Container } from "@/components/ui";
import { getSitePage } from "@/content";
import { getBlogPosts } from "@/content/repositories/blog-post";
import { getPageModules } from "@/content/repositories/page-modules";
import type { HeroModule } from "@/content/types/page-modules";
import { metadataForSlug } from "../_shared/metadata";

const GRID_DELAYS = [
  "fade-delay-100",
  "fade-delay-200",
  "fade-delay-300",
  "fade-delay-400",
] as const;

const GRID_STAGGERS = ["", "sm:mt-8", "sm:mt-4"] as const;

/**
 * Reads the `/admin/pages/blog` hero. Works with either editorial hero type;
 * empty fields fall back to the built-in journal copy and latest post cover.
 *
 * @param hero - CMS hero module, if any
 */
function blogHeroFromModules(hero: HeroModule | undefined) {
  if (
    !hero ||
    (hero.type !== "page-minimal" && hero.type !== "simple-banner")
  ) {
    return {};
  }
  const imageSrc =
    hero.type === "page-minimal" ? hero.heroImage : hero.backgroundImage;
  return {
    imageSrc,
    eyebrow: hero.eyebrow,
    title: hero.title,
    subtitle: hero.subtitle,
    ctaLabel: hero.ctaLabel,
    ctaHref: hero.ctaHref,
  };
}

/**
 * Blog index SEO from CMS modules/page meta only.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [modulesResult, pageResult] = await Promise.all([
    getPageModules("blog").catch(() => null),
    getSitePage("blog").catch(() => null),
  ]);
  return metadataForSlug(
    "blog",
    modulesResult?.data?.meta ?? pageResult?.data?.meta,
  );
}

/**
 * Blog index — Photo Soft Grid hero + equal Dawn Overlap post cards.
 */
export default async function BlogPage() {
  const [result, modulesResult] = await Promise.all([
    getBlogPosts(),
    getPageModules("blog").catch(() => null),
  ]);
  const posts = result.data ?? [];
  const cmsHero = blogHeroFromModules(modulesResult?.data?.hero);

  return (
    <>
      <BlogIndexHero
        {...cmsHero}
        imageSrc={cmsHero.imageSrc || posts[0]?.image}
      />

      <section
        id="journal"
        className="relative scroll-mt-[calc(var(--site-header-height)+0.75rem)] bg-white section-padding-y"
      >
        <Container size="2xl">
          {posts.length > 0 ? (
            <ul className="grid list-none gap-10 p-0 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 lg:gap-x-10">
              {posts.map((post, index) => (
                <li key={post.slug}>
                  <BlogPostCard
                    post={post}
                    revealDelayClass={GRID_DELAYS[index % GRID_DELAYS.length]}
                    staggerClass={GRID_STAGGERS[index % GRID_STAGGERS.length]}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <BlogIndexEmpty />
          )}
        </Container>
      </section>
    </>
  );
}
