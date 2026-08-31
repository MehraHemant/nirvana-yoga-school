import type { ReactNode } from "react";
import OnlineSectionShell from "./OnlineSectionShell";

type OnlineOverviewSectionProps = {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  overview: string;
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function OnlineOverviewSection({
  id = "overview",
  title = "Overview",
  description,
  overview,
}: OnlineOverviewSectionProps) {
  const paragraphs = splitParagraphs(overview);

  return (
    <OnlineSectionShell id={id} title={title} description={description}>
      <div className="space-y-5">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="type-body text-ink">
            {paragraph}
          </p>
        ))}
      </div>
    </OnlineSectionShell>
  );
}
