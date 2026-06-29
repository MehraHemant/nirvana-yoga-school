import { Container } from "@/components/ui";
import type { SitePageCard } from "@/data/sitePages";
import { ArrowRight } from "@/icons";
import { sectionTone } from "../utils";

export default function CardsModule({
  cards,
  fallbackHref,
  toneIndex,
}: {
  cards: SitePageCard[];
  fallbackHref?: string;
  toneIndex: number;
}) {
  return (
    <section className={`${sectionTone(toneIndex)} py-16 sm:py-20`}>
      <Container size="2xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <a
              key={card.title}
              href={card.href ?? fallbackHref ?? "#contact"}
              className="group flex min-h-[220px] flex-col justify-between rounded-3xl border border-ink/6 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"
            >
              <div>
                <h3 className="type-display-sm font-serif text-ink transition-colors group-hover:text-primary">
                  {card.title}
                </h3>
                <p className="mt-4 type-body font-sans leading-relaxed text-muted">
                  {card.description}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 font-sans text-sm font-semibold text-primary">
                Learn more
                <ArrowRight size={16} />
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
