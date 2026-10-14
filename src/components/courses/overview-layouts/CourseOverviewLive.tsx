"use client";

import CourseOverviewQuote from "./CourseOverviewQuote";
import { OverviewMedia } from "./CourseOverviewVideos";
import { GlanceChips } from "./OverviewGlance";
import OverviewImagePanel from "./OverviewImagePanel";
import { resolveOverview } from "./resolve";
import {
  OverviewCopy,
  OverviewHeader,
  OverviewMotion,
  OverviewShell,
} from "./shared";
import type { CourseOverviewLayoutProps } from "./types";

/**
 * Live overview — chips under the title, copy | still, films, quiet quote.
 *
 * @param props - Same data props as `CourseOverview`
 */
export default function CourseOverviewLive(props: CourseOverviewLayoutProps) {
  const data = resolveOverview(props);
  const stillUrl = data.stillImage?.url.trim() ?? "";
  const hasVisual = Boolean(stillUrl);
  const imagesAreOnlyStill =
    Boolean(stillUrl) &&
    data.images.length === 1 &&
    data.images[0]?.url === stillUrl;
  const showFilms =
    data.showVideoPanel || (data.showImagePanel && !imagesAreOnlyStill);

  return (
    <OverviewShell htmlId={data.htmlId}>
      <div className="space-y-10 lg:space-y-12">
        <OverviewMotion className="space-y-6">
          <OverviewHeader data={data} />
          <GlanceChips specs={data.specs} />
        </OverviewMotion>
        <div
          className={
            hasVisual
              ? "grid items-start gap-10 lg:grid-cols-12 lg:gap-12"
              : undefined
          }
        >
          <OverviewMotion className={hasVisual ? "lg:col-span-7" : undefined}>
            <OverviewCopy data={data} />
          </OverviewMotion>
          {data.stillImage ? (
            <OverviewMotion className="lg:col-span-5">
              <OverviewImagePanel
                images={[data.stillImage]}
                className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-ink/8 bg-ink/10"
              />
            </OverviewMotion>
          ) : null}
        </div>
        {showFilms ? (
          <OverviewMotion>
            <OverviewMedia data={data} />
          </OverviewMotion>
        ) : null}
        {data.saying ? (
          <OverviewMotion>
            <CourseOverviewQuote
              text={data.saying.text}
              author={data.saying.author}
            />
          </OverviewMotion>
        ) : null}
      </div>
    </OverviewShell>
  );
}
