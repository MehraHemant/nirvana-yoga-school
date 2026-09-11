"use client";

import Image from "next/image";
import { stripHtml } from "@/lib/cms/blog-html";
import {
  FLOURISH_PATHS,
  getWhyNirvanaCardWashBySlot,
  type WhyNirvanaHighlight,
} from "./whyNirvanaShared";

/**
 * Faint corner leaf decoration for the section (not a card icon).
 * @param props.side Which top corner to occupy.
 */
export function SectionCornerLeaf({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className={`pointer-events-none absolute top-2 h-24 w-24 text-primary/10 sm:h-32 sm:w-32 ${
        side === "left" ? "left-2" : "right-2 -scale-x-100"
      }`}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      <path
        d="M18 88c22-8 38-28 42-52 8 20 28 36 52 40-26 6-48 22-58 44-6-18-20-28-36-32z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M60 36c-4 14-4 28 2 42"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}

/**
 * Pastel text card showing the full CMS highlight body.
 * @param props.item CMS highlight title and body.
 * @param props.index Highlight index for flourish rotation.
 * @param props.slot Flat grid slot for repeating gradient pattern.
 */
export function WhyNirvanaTextCard({
  item,
  index,
  slot,
}: {
  item: WhyNirvanaHighlight;
  index: number;
  slot: number;
}) {
  const body = stripHtml(item.body);
  const wash = getWhyNirvanaCardWashBySlot(slot);
  const flourish = FLOURISH_PATHS[index % FLOURISH_PATHS.length];

  return (
    <article
      className={`why-nirvana-text-card shadow-lg! relative flex h-full min-h-66 flex-col overflow-hidden rounded-2xl ${wash.base} p-5 sm:min-h-72 sm:p-6`}
    >
      <span
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] ${wash.glow} via-transparent to-transparent`}
        aria-hidden
      />
      <svg
        className="pointer-events-none absolute right-3 bottom-3 h-16 w-20 text-ink/15"
        viewBox="0 0 88 80"
        fill="none"
        aria-hidden
      >
        <path
          d={flourish}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <h4 className="type-h4 mb-2 font-semibold text-ink">{item.title}</h4>
        <p className="type-body text-ink">{body}</p>
      </div>
    </article>
  );
}

/**
 * Full-bleed photo cell with no overlay text.
 * @param props.src Real photo URL.
 * @param props.alt Accessible image description.
 * @param props.slot Flat grid slot for matching gradient frame pattern.
 */
export function WhyNirvanaImageCard({
  src,
  alt,
  slot,
}: {
  src: string;
  alt: string;
  slot: number;
}) {
  const wash = getWhyNirvanaCardWashBySlot(slot);

  return (
    <article
      className={`relative h-full min-h-66 overflow-hidden rounded-2xl p-px shadow-lg! sm:min-h-72 ${wash.base}`}
    >
      <div className="relative h-full min-h-[calc(16.5rem-2px)] overflow-hidden rounded-[calc(1rem-1px)] bg-white sm:min-h-[calc(18rem-2px)]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <span
          className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] ${wash.glow} via-transparent to-transparent`}
          aria-hidden
        />
      </div>
    </article>
  );
}
