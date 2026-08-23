import Image from "next/image";
import { Container } from "@/components/ui";
import type { RetreatHighlight } from "@/content/types/retreat-page";

type RetreatHighlightsBarProps = {
  highlights: RetreatHighlight[];
};

export default function RetreatHighlightsBar({
  highlights,
}: RetreatHighlightsBarProps) {
  if (highlights.length === 0) return null;

  return (
    <div className="border-b border-ink/8 bg-white py-8 md:py-12">
      <Container size="2xl" className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="group surface-card flex items-start gap-4 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg md:text-xl text-ink leading-snug font-bold transition-colors group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-1.5 type-body text-sm leading-relaxed text-ink">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}
