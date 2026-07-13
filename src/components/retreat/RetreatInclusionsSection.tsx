import { Check } from "@/icons";
import RetreatSectionShell from "./RetreatSectionShell";

type RetreatInclusionsSectionProps = {
  inclusions: string[];
};

export default function RetreatInclusionsSection({
  inclusions,
}: RetreatInclusionsSectionProps) {
  return (
    <RetreatSectionShell id="inclusions" title="Inclusions">
      <ul className="grid gap-3 sm:grid-cols-2">
        {inclusions.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white px-4 py-3.5 shadow-xs"
          >
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check size={14} className="text-primary" />
            </span>
            <span className="type-body text-ink/90">{item}</span>
          </li>
        ))}
      </ul>
    </RetreatSectionShell>
  );
}
