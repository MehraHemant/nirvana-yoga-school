import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCourseRail } from "@/components/blog/BlogCourseRail";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { BlogPostHero } from "@/components/blog/BlogPostHero";
import { Container } from "@/components/ui";
import { resolveYttHubCourses } from "@/content/mappers/resolve-ytt-hub-courses";
import { getYttHub } from "@/content/repositories/shared-sections";
import type { ResolvedYttHubCourse } from "@/content/types/shared-sections";
import { resolveBlogBodyHtml } from "@/lib/cms/blog-html";
import { fetchBlogPost, getAllBlogSlugs } from "@/lib/content";
import { metadataFromPageSeo } from "../../_shared/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generates static paths for all published blog post route slugs at build time.
 *
 * @returns List of dynamic slug parameters
 */
export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Blog post SEO from CMS post fields (title, excerpt, image).
 *
 * @param props - Dynamic route properties containing target slug promise
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return {};

  return metadataFromPageSeo({
    title: post.title,
    description: post.excerpt,
    ogImage: post.image,
  });
}

/**
 * Loads the current YTT hub placements for the article program rail.
 */
async function loadBlogCourses(): Promise<ResolvedYttHubCourse[]> {
  try {
    const hubResult = await getYttHub();
    return await resolveYttHubCourses(hubResult.data.courses);
  } catch {
    return [];
  }
}

/**
 * BlogPostPage displays the full structured copy body of an individual article
 * along with categories, header banners, publication dates, and back navigation.
 *
 * @param props - Dynamic page params containing the target post slug
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, courses] = await Promise.all([
    fetchBlogPost(slug),
    loadBlogCourses(),
  ]);

  if (!post) {
    notFound();
  }

  const bodyHtml = resolveBlogBodyHtml(post.bodyHtml, post.content);

  return (
    <>
      <BlogPostHero post={post} />

      <section className="relative bg-white">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/25 to-transparent"
          aria-hidden="true"
        />

        <Container
          size="2xl"
          className="grid px-0 md:px-0 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:items-start"
        >
          <article
            aria-label="Article"
            className="blog-post-article bg-white px-5 py-12 sm:py-16 md:px-8 lg:px-12 lg:py-16 xl:px-20"
          >
            <div className="mx-auto max-w-184">
              <BlogPostContent bodyHtml={bodyHtml} blocks={post.content} />
            </div>
          </article>

          <aside
            aria-labelledby="blog-programs-heading"
            className="border-t border-ink/10 bg-white px-5 py-12 sm:px-8 sm:py-16 lg:sticky lg:top-(--site-header-height) lg:h-[calc(100svh-var(--site-header-height))] lg:overflow-y-auto lg:overscroll-contain lg:border-l lg:border-t-0 lg:px-8 lg:py-14 lg:scrollbar-thin-primary xl:px-10"
          >
            <BlogCourseRail courses={courses} />
          </aside>
        </Container>
      </section>
    </>
  );
}
