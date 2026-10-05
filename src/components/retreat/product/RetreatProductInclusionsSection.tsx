import RetreatSectionShell from "@/components/retreat/RetreatSectionShell";
import { Check } from "@/icons";
import type { RetreatProductInclusionsContent } from "./retreatProductTypes";

type RetreatProductInclusionsSectionProps = {
  content: RetreatProductInclusionsContent;
};

/**
 * Two-column inclusion checklist with primary icon wells.
 *
 * @param content - Inclusion list and optional arrival note
 */
export default function RetreatProductInclusionsSection({
  content,
}: RetreatProductInclusionsSectionProps) {
  return (
    <RetreatSectionShell
      id="inclusions"
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.description}
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {content.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white px-4 py-3.5 shadow-xs transition hover:border-primary/20 hover:shadow-sm"
          >
            <span
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <Check size={14} />
            </span>
            <span className="type-body text-ink">{item}</span>
          </li>
        ))}
      </ul>
      {content.arrivalNote ? (
        <p className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3.5 text-sm leading-relaxed text-ink">
          {content.arrivalNote}
        </p>
      ) : null}
    </RetreatSectionShell>
  );
}
