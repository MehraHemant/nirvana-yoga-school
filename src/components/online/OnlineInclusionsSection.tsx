import type { ReactNode } from "react";
import { Check } from "@/icons";
import OnlineSectionShell from "./OnlineSectionShell";

type OnlineInclusionsSectionProps = {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  inclusions: string[];
};

export default function OnlineInclusionsSection({
  id = "inclusions",
  title = "Inclusions",
  description,
  inclusions,
}: OnlineInclusionsSectionProps) {
  return (
    <OnlineSectionShell id={id} title={title} description={description}>
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
    </OnlineSectionShell>
  );
}
