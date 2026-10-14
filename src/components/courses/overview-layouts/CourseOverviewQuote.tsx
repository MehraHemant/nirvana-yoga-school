/**
 * Editorial pull quote — thin primary rules, Lora italic, quiet attribution.
 *
 * @param props.text - Quote body copy
 * @param props.author - Optional attribution line
 */
export default function CourseOverviewQuote({
  text,
  author = "",
}: {
  text: string;
  author?: string | null;
}) {
  if (!text.trim()) return null;

  return (
    <figure className="border-y border-ink/10">
      <blockquote>
        <p className="font-quote italic text-pretty text-ink text-[clamp(1.125rem,1.05rem+0.35vw,1.3125rem)] leading-[1.75]">
          {text}
        </p>
      </blockquote>
      {author ? (
        <figcaption className="mt-5">
          <cite className="type-eyebrow text-primary not-italic">{author}</cite>
        </figcaption>
      ) : null}
    </figure>
  );
}
