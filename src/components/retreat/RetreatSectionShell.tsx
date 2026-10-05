import type { ReactNode } from "react";
import { Container, SectionHeader } from "@/components/ui";

type RetreatSectionShellProps = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  /** When true, constrains header and body to Container 2xl (full-page bands). */
  contained?: boolean;
};

/**
 * Shared retreat product section frame — header, rule, and padded body.
 *
 * @param id - Section HTML id (sticky nav target)
 * @param title - Section heading
 * @param description - Optional supporting copy
 * @param eyebrow - Optional uppercase label above the title
 * @param children - Section body
 * @param className - Optional extra section classes
 */
export default function RetreatSectionShell({
  id,
  title,
  description,
  eyebrow,
  children,
  className = "",
  contained = false,
}: RetreatSectionShellProps) {
  const body = (
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
      <div className="space-y-6">{children}</div>
    </div>
  );

  return (
    <section
      id={id}
      className={`scroll-mt-28 border-b border-ink/8 section-padding-y ${className}`}
    >
      {contained ? (
        <Container size="2xl" className="relative w-full">
          {body}
        </Container>
      ) : (
        body
      )}
    </section>
  );
}
