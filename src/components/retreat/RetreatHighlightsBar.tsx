import Image from "next/image";
import { Container } from "@/components/ui";
import type { RetreatHighlight } from "@/content/types/retreat-page";

type RetreatHighlightsBarProps = {
  highlights: RetreatHighlight[];
};

/**
 * Three-up photo cards under the retreat hero (yoga, healing, excursions).
 *
 * @param props.highlights - Title, description, and image from retreat CMS
 */
export default function RetreatHighlightsBar({
  highlights,
}: RetreatHighlightsBarProps) {
  if (highlights.length === 0) return null;

  return (
    <div className="border-b border-ink/8 bg-white py-10 md:py-14">
      <Container
        size="2xl"
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6"
      >
        {highlights.map((item) => (
          <article
            key={item.title}
            className="group overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-xs transition-shadow duration-300 hover:shadow-soft"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-surface-muted">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 md:p-6">
              <h3 className="type-h4 text-ink">{item.title}</h3>
              <p className="type-body mt-2 text-ink/70">{item.description}</p>
            </div>
          </article>
        ))}
      </Container>
    </div>
  );
}
