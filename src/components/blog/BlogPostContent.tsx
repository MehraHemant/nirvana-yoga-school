import Link from "next/link";
import type { BlogContentBlock } from "@/content/types";
import { ArrowRight } from "@/icons";
import { BlogHtmlContent } from "./BlogHtmlContent";

type BlogPostContentProps = {
  bodyHtml: string | null;
  blocks: BlogContentBlock[];
};

/**
 * Builds a stable key for a legacy structured content block.
 *
 * @param block - Legacy CMS content block
 * @param index - Block position
 */
function blockKey(block: BlogContentBlock, index: number) {
  const text =
    block.type === "list"
      ? block.items.join("-").slice(0, 40)
      : "text" in block
        ? block.text.slice(0, 40)
        : String(index);
  return `${block.type}-${text}-${index}`;
}

/**
 * Renders the legacy structured-block blog format.
 *
 * @param props - Structured CMS blocks
 */
function StructuredBlogContent({ blocks }: { blocks: BlogContentBlock[] }) {
  return (
    <div className="prose-blog space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "date") return null;

        if (block.type === "heading") {
          const Tag =
            block.level === 2 ? "h2" : block.level === 3 ? "h3" : "h4";
          return <Tag key={blockKey(block, index)}>{block.text}</Tag>;
        }

        if (block.type === "list") {
          return (
            <ul key={blockKey(block, index)}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={blockKey(block, index)}>{block.text}</p>;
      })}
    </div>
  );
}

/**
 * Renders either rich HTML or legacy blocks and the blog return link.
 *
 * @param props - Resolved HTML and legacy fallback blocks
 */
export function BlogPostContent({ bodyHtml, blocks }: BlogPostContentProps) {
  return (
    <>
      {bodyHtml ? (
        <BlogHtmlContent html={bodyHtml} />
      ) : (
        <StructuredBlogContent blocks={blocks} />
      )}
      <div className="mt-16 border-t border-ink/10 pt-7">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-4"
        >
          <ArrowRight
            size={15}
            className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1"
            aria-hidden="true"
          />
          Back to journal
        </Link>
      </div>
    </>
  );
}
