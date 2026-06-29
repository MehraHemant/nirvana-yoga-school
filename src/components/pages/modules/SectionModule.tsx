"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Container, MediaLightbox, SectionHeader } from "@/components/ui";
import type { SitePageSection } from "@/data/sitePages";
import { Check, ChevronLeft, ChevronRight, Plus } from "@/icons";
import { reducedTransition } from "@/lib/motion";
import SectionBlocksRenderer from "./SectionBlocksRenderer";
import { sectionTone } from "../utils";

function BodyText({ body }: { body: string }) {
  return (
    <div className="space-y-4">
      {body.split("\n\n").map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className="type-body font-sans leading-relaxed text-muted"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 font-sans text-sm leading-relaxed text-muted"
        >
          <Check size={16} className="mt-0.5 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MediaPanel({ images, title }: { images: string[]; title: string }) {
  const prefersReduced = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  const current = images[index] ?? images[0];

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-ink/5 shadow-card">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative block aspect-[4/5] w-full lg:aspect-[3/4]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reducedTransition(prefersReduced, { duration: 0.3 })}
              className="absolute inset-0"
            >
              <Image
                src={current}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setIndex((i) => (i - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((url, dotIndex) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  aria-label={`Show image ${dotIndex + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    dotIndex === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={images.map((url) => ({ type: "image" as const, url }))}
        activeIndex={index}
        onChangeActiveIndex={setIndex}
        title={title}
      />
    </>
  );
}

function FaqList({ body, items }: { body?: string; items?: string[] }) {
  const prefersReduced = useReducedMotion() ?? false;
  const pairs: { question: string; answer?: string }[] = [];
  if (body) {
    const lines = body.split("\n\n").filter(Boolean);
    for (let i = 0; i < lines.length; i += 2) {
      pairs.push({ question: lines[i], answer: lines[i + 1] });
    }
  }
  const [openIndex, setOpenIndex] = useState(0);

  if (pairs.length === 0 && items) {
    return <ItemList items={items} />;
  }

  return (
    <div className="space-y-3">
      {pairs.map((pair, index) => (
        <article
          key={pair.question.slice(0, 48)}
          className="overflow-hidden rounded-2xl border border-ink/6 bg-white shadow-card"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
          >
            <span className="type-display-sm font-serif text-ink">
              {pair.question}
            </span>
            <Plus
              size={18}
              className={`shrink-0 text-primary transition-transform ${
                openIndex === index ? "rotate-45" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {openIndex === index && pair.answer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reducedTransition(prefersReduced, {
                  duration: 0.25,
                })}
                className="overflow-hidden"
              >
                <p className="border-t border-ink/6 px-5 pb-5 pt-4 font-sans text-sm leading-relaxed text-muted">
                  {pair.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </article>
      ))}
    </div>
  );
}

export default function SectionModule({
  section,
  toneIndex,
  reverse = false,
}: {
  section: SitePageSection;
  toneIndex: number;
  reverse?: boolean;
}) {
  const images =
    section.images && section.images.length > 0
      ? section.images
      : section.image
        ? [section.image]
        : [];
  const hasMedia = images.length > 0;
  const hasBlocks = section.blocks && section.blocks.length > 0;
  const isFaq =
    section.blocks?.some((b) => b.type === "faq") || section.layout === "faq";

  return (
    <section className={`${sectionTone(toneIndex)} py-16 sm:py-20`}>
      <Container size="2xl">
        <div
          className={`grid grid-cols-1 gap-10 ${
            hasMedia
              ? `lg:grid-cols-2 lg:items-start ${reverse ? "lg:[direction:rtl]" : ""}`
              : ""
          }`}
        >
          {hasMedia && (
            <div className={reverse ? "lg:[direction:ltr]" : ""}>
              <MediaPanel images={images} title={section.title} />
            </div>
          )}

          <div className={reverse ? "lg:[direction:ltr]" : ""}>
            <SectionHeader
              eyebrow={section.eyebrow ?? "Section"}
              title={<span className="text-balance">{section.title}</span>}
              className="mb-6"
            />

            {hasBlocks ? (
              <SectionBlocksRenderer blocks={section.blocks!} />
            ) : isFaq ? (
              <FaqList body={section.body} items={section.items} />
            ) : (
              <>
                {section.body && <BodyText body={section.body} />}
                {section.items && section.items.length > 0 && (
                  <ItemList items={section.items} />
                )}
              </>
            )}

            {!hasBlocks && section.subsections && section.subsections.length > 0 && (
              <div className="mt-8 space-y-4">
                {section.subsections.map((sub) => (
                  <article
                    key={sub.title}
                    className="rounded-2xl border border-ink/6 bg-white p-5 shadow-card sm:p-6"
                  >
                    <h3 className="type-display-sm mb-3 font-serif text-ink">
                      {sub.title}
                    </h3>
                    {sub.body && (
                      <p className="type-body font-sans leading-relaxed text-muted">
                        {sub.body}
                      </p>
                    )}
                    {sub.items && sub.items.length > 0 && (
                      <ItemList items={sub.items} />
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
