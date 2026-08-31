"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { Heading } from "@/components/ui";
import { teacherPageHref } from "@/content/teachers-slug";
import { ArrowRight } from "@/icons";
import { EASE_OUT } from "@/lib/motion";
import OnlineSectionShell from "./OnlineSectionShell";

const TEACHERS_DESCRIPTION =
  "Learn from experienced faculty rooted in traditional lineages — available throughout your self-paced training.";

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

type OnlineTeachersSectionProps = {
  teachers: TeacherProfile[];
};

/**
 * Deep link to the shared faculty page.
 *
 * @param name - Teacher display name (accessible link label)
 * @param href - Faculty page deep link
 * @param className - Optional layout classes
 */
function ProfileLink({
  name,
  href,
  className = "mt-5",
}: {
  name: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`Show more about ${name}`}
      className={`group/link inline-flex items-center gap-1.5 type-ui font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
      Show more
      <ArrowRight
        size={14}
        className="transition-transform duration-300 group-hover/link:translate-x-0.5"
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
 * @param priority - Eager-load lead portrait
 */
function TeacherPhoto({
  teacher,
  sizes,
  className,
  priority = false,
}: {
  teacher: TeacherProfile;
  sizes: string;
  className: string;
  priority?: boolean;
}) {
  const src = teacher.image.trim();

  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={teacher.name}
          fill
          priority={priority}
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes={sizes}
        />
      ) : (
        <div className="absolute inset-0 bg-sand" aria-hidden />
      )}
    </div>
  );
}

/**
 * Lead teacher — full-width editorial strip (portrait + copy, no card chrome).
 *
 * @param teacher - Faculty profile
 */
function LeadTeacher({ teacher }: { teacher: TeacherProfile }) {
  const href = teacherPageHref(teacher.name);
  const role = teacher.experienceSummary.trim();

  return (
    <motion.article
      variants={itemVariants}
      className="group grid items-start gap-6 md:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] md:gap-10 lg:gap-14"
    >
      <TeacherPhoto
        teacher={teacher}
        sizes="(max-width: 768px) 92vw, 40vw"
        className="aspect-4/5 w-full"
        priority
      />
      <div className="flex min-w-0 flex-col justify-center md:py-2 lg:py-4">
        {role ? (
          <p className="type-eyebrow text-muted">{role}</p>
        ) : null}
        <Heading as="h3" size="h2" className={role ? "mt-2" : undefined}>
          {teacher.name}
        </Heading>
        <p className="type-body mt-5 max-w-prose text-ink">
          {teacher.bio}
        </p>
        <ProfileLink name={teacher.name} href={href} />
      </div>
    </motion.article>
  );
}

/**
 * Supporting teacher — portrait with name and role underneath (no overlays).
 *
 * @param teacher - Faculty profile
 */
function SupportingTeacher({ teacher }: { teacher: TeacherProfile }) {
  const href = teacherPageHref(teacher.name);
  const role = teacher.experienceSummary.trim();

  return (
    <motion.article variants={itemVariants} className="group flex flex-col">
      <TeacherPhoto
        teacher={teacher}
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
        className="aspect-3/4 w-full"
      />
      <div className="mt-3.5 min-w-0">
        {role ? (
          <p className="type-eyebrow text-muted">{role}</p>
        ) : null}
        <Heading as="h3" size="h4" className={role ? "mt-1" : undefined}>
          {teacher.name}
        </Heading>
        <ProfileLink
          name={teacher.name}
          href={href}
          className="mt-2.5"
        />
      </div>
    </motion.article>
  );
}

/**
 * Supporting grid columns by count — keeps even rows when possible.
 *
 * @param count - Number of supporting teachers
 */
function supportingGridClass(count: number): string {
  if (count <= 1) return "grid max-w-56 grid-cols-1 gap-y-8 sm:max-w-64";
  if (count === 2 || count === 4) {
    return "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8";
  }
  return "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8";
}

/**
 * Online course teachers band — editorial lead strip + supporting portrait grid.
 *
 * @param teachers - Faculty list for this course
 */
export default function OnlineTeachersSection({
  teachers,
}: OnlineTeachersSectionProps) {
  if (teachers.length === 0) return null;

  const [lead, ...rest] = teachers;

  return (
    <OnlineSectionShell
      id="teachers"
      title="Teachers"
      description={TEACHERS_DESCRIPTION}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        variants={listVariants}
        className="space-y-12 md:space-y-16"
      >
        <LeadTeacher teacher={lead} />

        {rest.length > 0 ? (
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-baseline gap-4">
              <p className="type-eyebrow shrink-0 text-muted">Also teaching</p>
              <span className="h-px flex-1 bg-ink/10" aria-hidden />
            </div>
            <div className={supportingGridClass(rest.length)}>
              {rest.map((teacher) => (
                <SupportingTeacher key={teacher.name} teacher={teacher} />
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>
    </OnlineSectionShell>
  );
}
