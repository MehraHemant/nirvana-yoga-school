import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui";

type RetreatSectionShellProps = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function RetreatSectionShell({
  id,
  title,
  description,
  children,
  className = "",
}: RetreatSectionShellProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 border-b border-ink/8 py-14 md:py-16 ${className}`}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <SectionHeader
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
