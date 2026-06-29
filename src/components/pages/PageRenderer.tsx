"use client";

import type { SitePage } from "@/data/sitePages";
import CardsModule from "./modules/CardsModule";
import GalleryModule from "./modules/GalleryModule";
import HighlightsModule from "./modules/HighlightsModule";
import PackagesModule from "./modules/PackagesModule";
import SectionModule from "./modules/SectionModule";
import TeachersModule from "./modules/TeachersModule";
import TimelineModule from "./modules/TimelineModule";
import { shouldSkipSection } from "./utils";

export default function PageRenderer({ page }: { page: SitePage }) {
  let toneIndex = 0;

  const sections = page.sections.filter(
    (section) =>
      !shouldSkipSection(section.title) &&
      !(page.people?.length && /our teachers/i.test(section.title)),
  );

  return (
    <>
      {page.highlights && page.highlights.length > 0 && (
        <HighlightsModule
          highlights={page.highlights}
          toneIndex={toneIndex++}
        />
      )}

      {sections.map((section, index) => {
        const currentTone = toneIndex++;

        if (section.layout === "timeline" && section.subsections?.length) {
          return (
            <TimelineModule
              key={section.title}
              section={section}
              toneIndex={currentTone}
            />
          );
        }

        return (
          <SectionModule
            key={section.title}
            section={section}
            toneIndex={currentTone}
            reverse={index % 2 === 1}
          />
        );
      })}

      {page.people && page.people.length > 0 && (
        <TeachersModule people={page.people} toneIndex={toneIndex++} />
      )}

      {page.packages && page.packages.length > 0 && (
        <PackagesModule
          packages={page.packages}
          ctaHref={page.ctaHref}
          toneIndex={toneIndex++}
        />
      )}

      {page.gallery && page.gallery.length > 0 && (
        <GalleryModule images={page.gallery} toneIndex={toneIndex++} />
      )}

      {page.cards && page.cards.length > 0 && (
        <CardsModule
          cards={page.cards}
          fallbackHref={page.ctaHref}
          toneIndex={toneIndex++}
        />
      )}
    </>
  );
}
