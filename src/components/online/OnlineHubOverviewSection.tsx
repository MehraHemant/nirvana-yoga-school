"use client";

import { WelcomeSection } from "@/components/home";
import { mapOnlineHubToHomeWelcome } from "@/content/mappers/online-hub";
import type { OverviewModule } from "@/content/types/page-modules";

type OnlineHubOverviewSectionProps = {
  /** Online hub overview module from page_modules */
  overview: OverviewModule;
};

/**
 * Online hub overview — YTT/homepage welcome treatment with a single video
 * instead of the image collage.
 *
 * @param props - Overview module (copy + video media)
 */
export default function OnlineHubOverviewSection({
  overview,
}: OnlineHubOverviewSectionProps) {
  return (
    <div className="ytt-hub-shared ytt-hub-overview">
      <WelcomeSection content={mapOnlineHubToHomeWelcome(overview)} />
    </div>
  );
}
