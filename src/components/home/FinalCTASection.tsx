import Image from "next/image";
import { Button, Container, Heading, Pill } from "@/components/ui";
import { DEFAULT_HOME_PAGE_CONTENT } from "@/content/data/dedicated-page-defaults";
import type { HomeFinalCtaContent } from "@/content/types/dedicated-pages";
import { ArrowRight, WhatsApp } from "@/icons";
import { resolveSectionHtmlId } from "@/lib/html-id";

type FinalCTASectionProps = {
  /** Optional CMS final CTA content */
  content?: HomeFinalCtaContent;
};

/**
 * Homepage bottom conversion band with primary and WhatsApp CTAs.
 *
 * @param props - Optional CMS final CTA fields
 */
export default function FinalCTASection({
  content = DEFAULT_HOME_PAGE_CONTENT.finalCta,
}: FinalCTASectionProps) {
  const {
    pill,
    title,
    titleAccent,
    lead,
    primaryLabel,
    primaryHref,
    secondaryLabel,
    secondaryHref,
    image,
    imageAlt = "Sunrise yoga practice on the banks of the Ganges",
  } = content;

  return (
    <section
      id={resolveSectionHtmlId("contact", content._id)}
      className="relative py-16 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/75"
        aria-hidden="true"
      />

      <Container size="md" className="relative z-10 text-center">
        <Pill invert className="mb-4 sm:mb-6 mx-auto">
          {pill}
        </Pill>
        <Heading as="h2" align="center" font="serif" size="h2" invert>
          {title}
          <br />
          <span className="font-serif font-medium text-accent">
            {titleAccent}
          </span>
        </Heading>
        <p className="type-lead mt-4 sm:mt-6 text-white/85 max-w-2xl mx-auto">
          {lead}
        </p>

        <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <Button href={primaryHref} variant="primary" size="md">
            {primaryLabel}
            <ArrowRight size={16} />
          </Button>
          <Button href={secondaryHref} variant="outline-light" size="md">
            <WhatsApp size={16} />
            {secondaryLabel}
          </Button>
        </div>
      </Container>
    </section>
  );
}
