import RetreatSectionShell from "@/components/retreat/RetreatSectionShell";
import { BadgeStar } from "@/icons";
import type { RetreatProductTestimonialsContent } from "./retreatProductTypes";

type RetreatProductTestimonialsSectionProps = {
  content: RetreatProductTestimonialsContent;
};

/**
 * Initials avatar from a display name.
 *
 * @param name - Guest name
 */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Compact guest quote cards for the reviews anchor.
 *
 * @param content - Testimonial list
 */
export default function RetreatProductTestimonialsSection({
  content,
}: RetreatProductTestimonialsSectionProps) {
  return (
    <RetreatSectionShell
      id="reviews"
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.description}
    >
      <div className="grid items-stretch gap-5 md:grid-cols-3 md:gap-6">
        {content.items.map((item) => {
          const initials = initialsFromName(item.name);

          return (
            <blockquote
              key={`${item.name}-${item.location}`}
              className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-primary/10 bg-primary/3 p-6 shadow-card sm:p-7"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 right-5 select-none text-[4.5rem] leading-none text-primary/12"
              >
                &ldquo;
              </span>
              <div className="relative flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].slice(0, item.rating).map((star) => (
                  <BadgeStar
                    key={`${item.name}-star-${star}`}
                    size={14}
                    aria-hidden
                  />
                ))}
                <span className="sr-only">{item.rating} out of 5</span>
              </div>
              <div className="relative mt-4 flex min-h-0 flex-1 flex-col">
                <p className="type-body line-clamp-5 overflow-hidden text-ink">
                  {item.quote}
                </p>
              </div>
              <footer className="relative mt-5 flex shrink-0 items-center gap-3 border-t border-primary/10 pt-4">
                {initials ? (
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold tracking-wide text-primary"
                  >
                    {initials}
                  </span>
                ) : null}
                <cite className="not-italic">
                  <span className="type-ui font-semibold text-ink">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink/60">
                    {item.location}
                  </span>
                </cite>
              </footer>
            </blockquote>
          );
        })}
      </div>
    </RetreatSectionShell>
  );
}
