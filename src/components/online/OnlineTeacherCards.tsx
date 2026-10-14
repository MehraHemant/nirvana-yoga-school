"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { Heading } from "@/components/ui";
import { teacherPageHref } from "@/content/teachers-slug";
import { ArrowRight } from "@/icons";
import { EASE_OUT } from "@/lib/motion";

const CARD_EXPERTISE_LIMIT = 3;

export const teacherCardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
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
  className = "mt-3",
}: {
  name: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`Show more about ${name}`}
      className={`group/link inline-flex items-center gap-1 type-ui font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
      Show more
      <ArrowRight
        size={13}
        className="transition-transform duration-300 group-hover/link:translate-x-0.5"
      />
    </Link>
  );
}

/**
 * Compact portrait — `object-cover` with a capped height so cards stay even.
 *
 * @param teacher - Faculty profile
 * @param sizes - Next Image `sizes` string
 * @param className - Wrapper classes (aspect / rounding)
 * @param priority - Eager-load the first portrait
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
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes={sizes}
        />
      ) : (
        <div className="absolute inset-0 bg-sand" aria-hidden />
      )}
    </div>
  );
}

/**
 * Equal-size online faculty card — compact portrait, role, clamped bio, chips.
 *
 * @param teacher - Faculty profile
 * @param priority - Eager-load the portrait
 */
export function OnlineTeacherCard({
  teacher,
  priority = false,
}: {
  teacher: TeacherProfile;
  priority?: boolean;
}) {
  const href = teacherPageHref(teacher.name);
  const role = teacher.experienceSummary.trim();
  const bio = teacher.bio.trim();
  const expertise = teacher.expertise
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, CARD_EXPERTISE_LIMIT);

  return (
    <motion.article
      variants={teacherCardVariants}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card"
    >
      <TeacherPhoto
        teacher={teacher}
        sizes="(max-width: 768px) 92vw, (max-width: 1024px) 44vw, 280px"
        className="aspect-4/5 w-full max-h-72"
        priority={priority}
      />
      <div className="flex min-w-0 flex-1 flex-col px-4 py-4">
        {role ? (
          <p className="type-eyebrow line-clamp-1 text-primary">{role}</p>
        ) : null}
        <Heading
          as="h3"
          size="display-sm"
          className={role ? "mt-1" : undefined}
        >
          {teacher.name}
        </Heading>
        {bio ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink">
            {bio}
          </p>
        ) : null}
        {expertise.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {expertise.map((item) => (
              <li
                key={item}
                className="inline-flex items-center rounded-full border border-ink/10 bg-sand px-2 py-0.5 text-[11px] leading-tight text-ink/80"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        <ProfileLink
          name={teacher.name}
          href={href}
          className="mt-auto pt-3"
        />
      </div>
    </motion.article>
  );
}
