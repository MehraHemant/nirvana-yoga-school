import type { ReactNode } from "react";
import { Container, SectionHeader } from "@/components/ui";

type YttHubSectionProps = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  invert?: boolean;
};

export default function YttHubSection({
  id,
  title,
  description,
  children,
  className = "bg-white",
  invert = false,
}: YttHubSectionProps) {
  return (
    <section id={id} className={`scroll-mt-28 py-14 md:py-16 ${className}`}>
      <Container size="2xl">
        <SectionHeader
          title={title}
          description={description}
          align="left"
          invert={invert}
          className="mb-8 max-w-3xl md:mb-10"
        />
        {children}
      </Container>
    </section>
  );
}
