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
    <div className="border-b border-secondary/10 bg-white">
      <Container size="2xl" className="grid gap-4 py-6 md:grid-cols-3 md:py-8">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-3xl border border-secondary/10 bg-secondary/5 px-5 py-5"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-secondary/10">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-xl text-ink">{item.title}</p>
              <p className="mt-1 type-body text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}
