"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui";
import type { SectionContentBlock } from "@/content/types/site-page";
import { Check, Plus } from "@/icons";
import { reducedTransition } from "@/lib/motion";

function ParagraphText({
  text,
  lead = false,
}: {
  text: string;
  lead?: boolean;
}) {
  return (
    <div className="space-y-4">
      {text
        .split("\n\n")
        .filter(Boolean)
        .map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className={`leading-relaxed text-ink ${lead ? "type-lead" : "type-body"}`}
          >
            {paragraph}
          </p>
        ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-sm leading-relaxed text-ink"
        >
          <Check size={16} className="mt-0.5 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FaqAccordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((pair, index) => (
        <article
          key={pair.question.slice(0, 48) || `faq-${index}`}
          className="overflow-hidden rounded-2xl border border-ink/6 bg-white shadow-card"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
          >
            <span className="type-display-sm text-ink">{pair.question}</span>
            <Plus
              size={18}
              className={`shrink-0 text-primary transition-transform ${openIndex === index ? "rotate-45" : ""}`}
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
                <p className="border-t border-ink/6 px-5 pb-5 pt-4 text-sm leading-relaxed text-ink">
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

function CtaBlock({
  block,
}: {
  block: Extract<SectionContentBlock, { type: "cta" }>;
}) {
  if (!block.label || !block.href) return null;

  const variant =
    block.variant === "secondary"
      ? "secondary"
      : block.variant === "outline"
        ? "ghost"
        : "primary";

  return (
    <div className="mt-6">
      <Button
        href={block.href}
        variant={variant}
        size="md"
        className={
          block.variant === "outline" ? "border border-ink/15" : undefined
        }
        {...(block.openInNewTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {block.label}
      </Button>
    </div>
  );
}

function extractYouTubeId(url: string) {
  const trimmed = url.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }
    return parsed.searchParams.get("v") ?? trimmed;
  } catch {
    return trimmed;
  }
}

function VideoEmbed({
  block,
}: {
  block: Extract<SectionContentBlock, { type: "video" }>;
}) {
  if (!block.url) return null;
  const id = extractYouTubeId(block.url);

  return (
    <figure className="mt-6 overflow-hidden rounded-3xl bg-ink/5 shadow-card">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={block.caption || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      {block.caption ? (
        <figcaption className="px-4 py-3 text-center text-ink text-sm">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function SubsectionCard({
  block,
}: {
  block: Extract<SectionContentBlock, { type: "subsection" }>;
}) {
  return (
    <article className="mt-4 rounded-2xl border border-ink/6 bg-white p-5 shadow-card sm:p-6">
      {block.imageUrl ? (
        <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src={block.imageUrl}
            alt={block.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <h3 className="type-display-sm mb-3 text-ink">{block.title}</h3>
      {block.paragraph ? <ParagraphText text={block.paragraph} /> : null}
      {block.bullets && block.bullets.length > 0 ? (
        <BulletList items={block.bullets} />
      ) : null}
    </article>
  );
}

function GalleryGrid({
  block,
}: {
  block: Extract<SectionContentBlock, { type: "gallery" }>;
}) {
  const urls = block.urls.filter(Boolean);
  if (urls.length === 0) return null;

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {urls.map((url) => (
        <div
          key={url}
          className="relative aspect-square overflow-hidden rounded-2xl bg-ink/5"
        >
          <Image
            src={url}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: SectionContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return block.text ? <ParagraphText text={block.text} /> : null;
    case "lead":
      return block.text ? <ParagraphText text={block.text} lead /> : null;
    case "bullets":
      return <BulletList items={block.items} />;
    case "faq":
      return <FaqAccordion items={block.items} />;
    case "cta":
      return <CtaBlock block={block} />;
    case "image":
      return block.url ? (
        <figure className="mt-6 overflow-hidden rounded-3xl bg-ink/5 shadow-card">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={block.url}
              alt={block.alt ?? ""}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {block.caption ? (
            <figcaption className="px-4 py-3 text-center text-ink text-sm">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null;
    case "gallery":
      return <GalleryGrid block={block} />;
    case "subsection":
      return <SubsectionCard block={block} />;
    case "video":
      return <VideoEmbed block={block} />;
    default:
      return null;
  }
}

export default function SectionBlocksRenderer({
  blocks,
}: {
  blocks: SectionContentBlock[];
}) {
  if (!blocks.length) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <div key={`${block.type}-${index}`}>
          <BlockRenderer block={block} />
        </div>
      ))}
    </div>
  );
}
