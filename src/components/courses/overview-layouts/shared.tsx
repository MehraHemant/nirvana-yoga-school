"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Container, SectionHeader } from "@/components/ui";
import { SanitizedHtml } from "@/components/ui/SanitizedHtml";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";
import type { ResolvedOverview } from "./types";

/**
 * Section frame with site Container and optional surface tone.
 *
 * @param props.htmlId - Section id
 * @param props.children - Layout body
 * @param props.className - Background / padding utilities
 */
export function OverviewShell({
  htmlId,
  children,
  className = "bg-white",
}: {
  htmlId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={htmlId}
      className={`relative scroll-mt-28 overflow-hidden section-padding-y ${className}`}
    >
      <Container size="2xl" className="w-full">
        {children}
      </Container>
    </section>
  );
}

/**
 * In-view fade used by layout blocks.
 *
 * @param props.children - Animated content
 * @param props.className - Wrapper classes
 */
export function OverviewMotion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Eyebrow + title from CMS overview fields.
 *
 * @param props.data - Resolved overview
 * @param props.align - Header alignment
 * @param props.className - Extra classes
 */
export function OverviewHeader({
  data,
  align = "left",
  className = "mb-4 max-w-6xl",
}: {
  data: Pick<ResolvedOverview, "eyebrow" | "title">;
  align?: "left" | "center" | "end";
  className?: string;
}) {
  if (!data.eyebrow && !data.title) return null;
  return (
    <SectionHeader
      eyebrow={data.eyebrow}
      title={data.title}
      align={align}
      className={className}
    />
  );
}

/**
 * Lead HTML plus optional heading and supporting line.
 *
 * @param props.data - Resolved overview copy
 * @param props.leadClassName - Classes for the HTML body
 */
export function OverviewCopy({
  data,
  leadClassName = "cms-overview-lead flex flex-col gap-2 type-body text-ink",
}: {
  data: Pick<ResolvedOverview, "heading" | "overviewHtml" | "supporting">;
  leadClassName?: string;
}) {
  return (
    <div className="space-y-4">
      {data.heading ? (
        <h3 className="type-h3 mb-1 max-w-3xl text-ink">{data.heading}</h3>
      ) : null}
      {data.overviewHtml ? (
        <SanitizedHtml html={data.overviewHtml} className={leadClassName} />
      ) : null}
      {data.supporting ? (
        <p className="type-body text-ink">{data.supporting}</p>
      ) : null}
    </div>
  );
}
