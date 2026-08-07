import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogHtmlContent } from "@/components/blog/BlogHtmlContent";
import { Container } from "@/components/ui";
import type { BlogContentBlock } from "@/content/types";
import { ArrowRight } from "@/icons";
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
      <section className="relative overflow-hidden bg-primary text-white pt-[var(--site-header-height)]">
        <Image
          src={post.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/75 to-transparent" />
        <Container
          size="2xl"
          className="relative z-10 flex min-h-[54svh] items-end py-16 sm:py-20"
        >
          <div className="max-w-4xl">
            <p className="type-eyebrow mb-4 text-white/80">{post.category}</p>
            <h1 className="type-h1 text-balance text-white">{post.title}</h1>
            {post.publishedAt && (
              <p className="type-ui mt-4 text-white/70">{post.publishedAt}</p>
            )}
            <p className="type-lead mt-6 max-w-2xl font-sans leading-relaxed text-white/85">
              {post.excerpt}
            </p>
          </div>
        </Container>
      </section>

      <article className="bg-white py-20 sm:py-28">
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
