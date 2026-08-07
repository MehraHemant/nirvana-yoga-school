import Image from "next/image";
import RetreatSectionShell from "./RetreatSectionShell";

type RetreatOverviewSectionProps = {
  overview: string;
  images: string[];
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((p) => !/^The Nirvana Retreat Experience/i.test(p));
}

export default function RetreatOverviewSection({
  overview,
  images,
}: RetreatOverviewSectionProps) {
  const paragraphs = splitParagraphs(overview);

  return (
    <RetreatSectionShell id="overview" title="Overview">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-10">
        <div className="max-w-3xl space-y-5">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="type-body text-ink">
              {paragraph}
            </p>
          ))}
        </div>

        {images[0] && (
          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-3xl bg-accent/6">
              <Image
                src={images[0]}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            {images.slice(1, 3).map((src) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-2xl bg-accent/6"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 20vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </RetreatSectionShell>
  );
}
