import Image from "next/image";
import Link from "next/link";
import type { BlogPostDocument } from "@/content/types";
import { formatBlogPublishedDate } from "./blog-date";

type BlogPostCardProps = {
  post: BlogPostDocument;
  /** Optional staggered entrance delay class, e.g. `fade-delay-100`. */
  revealDelayClass?: string;
  /** Optional Dawn Overlap vertical stagger, e.g. `sm:mt-8`. */
  staggerClass?: string;
};

/**
 * Dawn Overlap archive card — landscape cover with overlapping title panel.
 *
 * @param props - Post data and optional motion / stagger classes
 */
export function BlogPostCard({
  post,
  revealDelayClass = "",
  staggerClass = "",
}: BlogPostCardProps) {
  const publishedDate = formatBlogPublishedDate(post.publishedAt);
  const imageAlt = post.title.trim() || "Journal essay";

  return (
    <article
      className={`animate-fade-up ${revealDelayClass} ${staggerClass}`.trim()}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group relative z-20 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-surface-muted"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-ink/5">
          <Image
            src={post.image}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>

        <div className="relative z-30 mx-auto -mt-8 w-[88%] bg-white px-4 py-5 shadow-soft sm:-mt-10 sm:px-5 sm:py-6">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] uppercase tracking-[0.16em] text-ink">
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

          <h3 className="mt-2 text-balance text-lg font-semibold leading-[1.35] tracking-[-0.015em] text-ink transition-colors duration-300 group-hover:text-primary">
            {post.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-ink">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
