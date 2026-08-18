"use client";

import Image from "next/image";
import Link from "next/link";
import type { TeacherProfile } from "@/components/home/TeachersSection";
import { teacherPageHref } from "@/content/teachers-slug";
import OnlineSectionShell from "./OnlineSectionShell";

type OnlineTeachersSectionProps = {
  teachers: TeacherProfile[];
};

/**
 * Compact online-course teacher card — “Show more” deep-links to `/teacher#slug`.
 *
 * @param props - Faculty profile
 */
function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-card">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
        <div className="relative mx-auto aspect-square w-28 shrink-0 overflow-hidden rounded-2xl sm:mx-0 sm:w-32">
          <Image
            src={teacher.image}
            alt={teacher.name}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="font-serif text-xl text-ink">{teacher.name}</h3>
            <p className="mt-1 text-sm font-medium text-muted">
              {teacher.experienceSummary}
            </p>
          </div>
          <p className="type-body text-muted line-clamp-3">{teacher.bio}</p>
          <Link
            href={teacherPageHref(teacher.name)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Show more
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Online course teachers band — profiles deep-link to the shared faculty page.
 *
 * @param props - Faculty list for this course
 */
export default function OnlineTeachersSection({
  teachers,
}: OnlineTeachersSectionProps) {
  if (teachers.length === 0) return null;

  return (
    <OnlineSectionShell id="teachers" title="Teachers">
      <div>
        {teachers.map((teacher, i) => {
          const isLast = i === teachers.length - 1;
          return (
            <div
              key={teacher.name}
              className={
                isLast ? undefined : "mb-5 border-b border-ink/10 pb-5"
              }
            >
              <TeacherCard teacher={teacher} />
            </div>
          );
        })}
      </div>
    </OnlineSectionShell>
  );
}
