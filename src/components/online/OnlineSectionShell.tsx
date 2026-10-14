import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui";

type OnlineSectionShellProps = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional uppercase label above the title */
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Shared online-course section frame — left header, rule, and padded body.
 *
 * @param id - Section HTML id (sticky nav target)
 * @param title - Section heading
 * @param description - Optional supporting copy
 * @param eyebrow - Optional uppercase label above the title
 * @param children - Section body
 * @param className - Optional extra section classes
 */
export default function OnlineSectionShell({
  id,
  title,
  description,
  eyebrow,
  children,
  className = "",
}: OnlineSectionShellProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 border-b border-ink/8 section-padding-y ${className}`}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="left"
            className="max-w-none"
          />
          <hr className="border-ink/8" />
        </div>
        {children}
      </div>
    </section>
  );
}
