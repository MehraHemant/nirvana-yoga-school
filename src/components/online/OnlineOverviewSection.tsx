import OnlineSectionShell from "./OnlineSectionShell";

type OnlineOverviewSectionProps = {
  overview: string;
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function OnlineOverviewSection({
  overview,
}: OnlineOverviewSectionProps) {
  const paragraphs = splitParagraphs(overview);

  return (
    <OnlineSectionShell id="overview" title="Overview">
      <div className="max-w-3xl space-y-5">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="type-body text-ink/85">
            {paragraph}
          </p>
        ))}
      </div>
    </OnlineSectionShell>
  );
}
