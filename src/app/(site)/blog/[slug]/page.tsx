import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogHtmlContent } from "@/components/blog/BlogHtmlContent";
import { Container } from "@/components/ui";
import type { BlogContentBlock } from "@/data/blogPosts";
import { ArrowRight } from "@/icons";
import { resolveBlogBodyHtml } from "@/lib/cms/blog-html";
import { fetchBlogPost, getAllBlogSlugs } from "@/lib/content";

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
 * Resolves HTML metadata tag titles and descriptions for individual blog posts.
 *
 * @param props - Dynamic route properties containing target slug promise
 * @returns Resolved page metadata attributes
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Nirvana Yoga School`,
      description: post.excerpt,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
    },
  };
}

function blockKey(block: BlogContentBlock, index: number) {
  const text =
    block.type === "list"
      ? block.items.join("-").slice(0, 40)
      : "text" in block
        ? block.text.slice(0, 40)
        : String(index);
  return `${block.type}-${text}-${index}`;
}

function BlogContent({ blocks }: { blocks: BlogContentBlock[] }) {
  return (
    <div className="prose-blog space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "date") return null;

        if (block.type === "heading") {
          const Tag =
            block.level === 2 ? "h2" : block.level === 3 ? "h3" : "h4";
          const sizeClass =
            block.level === 2
              ? "type-display-sm mt-10 mb-3 font-serif text-2xl text-ink first:mt-0"
              : block.level === 3
                ? "type-display-sm mt-8 mb-2 font-serif text-xl text-ink"
                : "mt-6 mb-2 font-sans text-base font-semibold text-ink";

          return (
            <Tag key={blockKey(block, index)} className={sizeClass}>
              {block.text}
            </Tag>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={blockKey(block, index)}
              className="list-disc space-y-2 pl-5 font-sans text-base leading-relaxed text-muted"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={blockKey(block, index)}
            className="type-body font-sans leading-relaxed text-muted"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

/**
 * BlogPostPage displays the full structured copy body of an individual article
 * along with categories, header banners, publication dates, and back navigation.
 *
 * @param props - Dynamic page params containing the target post slug
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  const bodyHtml = resolveBlogBodyHtml(post.bodyHtml, post.content);

  return (
    <>
      <section className="relative overflow-hidden bg-sand text-ink pt-[var(--site-header-height)]">
        <Image
          src={post.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-r from-sand via-sand/75 to-transparent" />
        <Container
          size="2xl"
          className="relative z-10 flex min-h-[54svh] items-end py-16 sm:py-20"
        >
          <div className="max-w-4xl">
            <p className="type-eyebrow mb-4 text-primary">{post.category}</p>
            <h1 className="type-h1 text-balance text-ink">{post.title}</h1>
            {post.publishedAt && (
              <p className="type-ui mt-4 text-muted">{post.publishedAt}</p>
            )}
            <p className="type-lead mt-6 max-w-2xl font-sans leading-relaxed text-ink/80">
              {post.excerpt}
            </p>
          </div>
        </Container>
      </section>

      <article className="bg-paper py-20 sm:py-28">
        <Container size="md">
          <div className="rounded-3xl border border-ink/6 bg-white p-6 shadow-card sm:p-10">
            {bodyHtml ? (
              <BlogHtmlContent html={bodyHtml} />
            ) : (
              <BlogContent blocks={post.content} />
            )}
            <Link
              href="/blog"
              className="mt-10 inline-flex items-center gap-2 font-sans text-sm font-semibold text-primary"
            >
              Back to blog
              <ArrowRight size={16} />
            </Link>
          </div>
        </Container>
      </article>
    </>
  );
}
