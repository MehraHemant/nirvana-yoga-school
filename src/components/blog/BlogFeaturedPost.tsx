import Image from "next/image";
import Link from "next/link";
import type { BlogPostDocument } from "@/content/types";
import { formatBlogPublishedDate } from "./blog-date";

type BlogFeaturedPostProps = {
  post: BlogPostDocument;
};

/**
 * Dawn Overlap lead essay — large cover with a floating title panel.
 *
 * @param props - Featured blog post document
 */
export function BlogFeaturedPost({ post }: BlogFeaturedPostProps) {
  const publishedDate = formatBlogPublishedDate(post.publishedAt);
  const imageAlt = post.title.trim() || "Featured journal essay";

  return (
    <article
      aria-labelledby="blog-featured-title"
      className="animate-fade-up"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group relative z-20 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-surface-muted"
      >
        <div className="relative aspect-16/10 overflow-hidden bg-ink/5 shadow-soft">
          <Image
            src={post.image}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>

        <div className="relative z-30 mx-auto -mt-10 max-w-lg bg-white px-6 py-6 sm:-mt-14 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-muted">
            <span className="text-primary">{post.category}</span>
            {publishedDate ? (
              <>
                <span className="opacity-40" aria-hidden="true">
                  ·
                </span>
                <time dateTime={post.publishedAt ?? undefined}>
                  {publishedDate}
                </time>
              </>
            ) : null}
          </div>

          <h2
            id="blog-featured-title"
            className="mt-2 text-balance font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-medium tracking-tight text-ink transition-colors duration-300 group-hover:text-primary"
          >
            {post.title}
          </h2>

          <p className="mt-3 font-sans text-sm leading-6 text-muted">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
