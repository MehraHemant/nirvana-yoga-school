import Image from "next/image";
import Link from "next/link";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { Heading } from "@/components/ui";
import { teacherPageHref } from "@/content/teachers-slug";
import { ArrowRight } from "@/icons";
import OnlineSectionShell from "./OnlineSectionShell";

type OnlineTeachersSectionProps = {
  teachers: TeacherProfile[];
};

/**
 * Role chip — a small pill, not an uppercase eyebrow.
 *
 * @param summary - Teacher `experienceSummary` (often a role title)
 * @param onPhoto - White glass chip when sitting on a portrait
 */
function ExperienceBadge({
  summary,
  onPhoto = false,
}: {
  summary: string;
  onPhoto?: boolean;
}) {
  if (!summary.trim()) return null;

  return (
    <span
      className={
        onPhoto
          ? "inline-block max-w-full rounded-full bg-white/92 px-3 py-1 type-ui text-xs font-semibold text-primary shadow-sm backdrop-blur-sm"
          : "inline-block max-w-full rounded-full bg-primary/10 px-3 py-1 type-ui text-xs font-semibold text-primary"
      }
    >
      {summary}
    </span>
  );
}

/**
 * Show more control — arrow nudges on the parent `group` hover.
 *
 * @param name - Teacher display name (accessible link label)
 * @param href - Faculty page deep link
 * @param className - Optional layout classes (e.g. grid-cell alignment)
 */
function ShowMoreLink({
  name,
  href,
  className = "mt-4",
}: {
  name: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`Show more about ${name}`}
      className={`inline-flex items-center gap-1.5 type-ui font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
      Show more
      <ArrowRight
        size={14}
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/**
 * Teacher portrait — `object-top` so faces stay in frame.
 *
 * @param teacher - Faculty profile
 * @param sizes - Next Image `sizes` string
 * @param className - Wrapper classes (aspect / rounding)
 */
function TeacherPhoto({
  teacher,
  sizes,
  className,
}: {
  teacher: TeacherProfile;
  sizes: string;
  className: string;
}) {
  const src = teacher.image.trim();

  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={teacher.name}
          fill
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes={sizes}
        />
      ) : (
        <div className="absolute inset-0 bg-sand" aria-hidden />
      )}
    </div>
  );
}

/**
 * Lead (or single leftover) teacher — warm split panel matching testimonials.
 *
 * @param teacher - Faculty profile
 */
function FeaturedTeacher({ teacher }: { teacher: TeacherProfile }) {
  const href = teacherPageHref(teacher.name);

  return (
    <article className="group overflow-hidden rounded-3xl border border-primary/10 bg-primary/3 shadow-card sm:grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
      <TeacherPhoto
        teacher={teacher}
        sizes="(max-width: 640px) 90vw, 272px"
        className="aspect-3/4 sm:aspect-auto sm:h-full sm:min-h-80"
      />
      <div className="flex min-w-0 flex-col justify-center px-6 py-6 sm:px-8 sm:py-8">
        <ExperienceBadge summary={teacher.experienceSummary} />
        <Heading as="h3" size="h3" className="mt-3">
          {teacher.name}
        </Heading>
        <p className="type-body mt-3 line-clamp-5 text-ink">{teacher.bio}</p>
        <ShowMoreLink name={teacher.name} href={href} />
      </div>
    </article>
  );
}

/**
 * Supporting teacher — name and role sit on the portrait; bio stays below.
 *
 * @param teacher - Faculty profile
 */
function PortraitTeacher({ teacher }: { teacher: TeacherProfile }) {
  const href = teacherPageHref(teacher.name);

  return (
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-3xl">
        <TeacherPhoto
          teacher={teacher}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
          className="aspect-3/4"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 via-ink/40 to-transparent px-4 pb-4 pt-16">
          <ExperienceBadge summary={teacher.experienceSummary} onPhoto />
          <Heading as="h3" size="h4" invert className="mt-2 drop-shadow-sm">
            {teacher.name}
          </Heading>
        </div>
      </div>
      <p className="type-body mt-4 line-clamp-2 text-ink">{teacher.bio}</p>
      <ShowMoreLink name={teacher.name} href={href} className="mt-auto pt-4" />
    </article>
  );
}

/**
 * Supporting grid — 2-col when the count is even, 3-col on lg otherwise
 * so a five-teacher course does not leave a lonely last cell.
 *
 * @param count - Number of supporting teachers
 */
function supportingGridClass(count: number): string {
  if (count <= 1) return "";
  if (count === 2 || count === 4) {
    return "grid gap-5 sm:grid-cols-2 sm:gap-6";
  }
  return "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6";
}

/**
 * Online course teachers band — profiles deep-link to the shared faculty page.
 *
 * @param teachers - Faculty list for this course
 */
export default function OnlineTeachersSection({
  teachers,
}: OnlineTeachersSectionProps) {
  if (teachers.length === 0) return null;

  const [lead, ...rest] = teachers;
  const useSplitForRest = rest.length === 1;

  return (
    <OnlineSectionShell id="teachers" title="Teachers">
      <div className="space-y-6 md:space-y-8">
        <FeaturedTeacher teacher={lead} />
        {useSplitForRest && rest[0] ? (
          <FeaturedTeacher teacher={rest[0]} />
        ) : null}
        {!useSplitForRest && rest.length > 0 ? (
          <div className={supportingGridClass(rest.length)}>
            {rest.map((teacher) => (
              <PortraitTeacher key={teacher.name} teacher={teacher} />
            ))}
          </div>
        ) : null}
      </div>
    </OnlineSectionShell>
  );
}
