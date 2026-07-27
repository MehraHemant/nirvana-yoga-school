"use client";

import { WelcomeSection } from "@/components/home";
import { mapYttHubToHomeWelcome } from "@/content/mappers/ytt-hub";
import type { YttHubContent } from "@/content/types/shared-sections";

type YttHubOverviewSectionProps = {
  hub: YttHubContent;
};

/**
 * YTT hub overview — homepage welcome/about treatment with hub CMS data.
 *
 * @param props - Full hub document (maps to {@link WelcomeSection} content)
 */
export default function YttHubOverviewSection({
  hub,
}: YttHubOverviewSectionProps) {
  return (
    <div className="ytt-hub-shared ytt-hub-overview">
      <WelcomeSection content={mapYttHubToHomeWelcome(hub)} />
    </div>
  );
}
