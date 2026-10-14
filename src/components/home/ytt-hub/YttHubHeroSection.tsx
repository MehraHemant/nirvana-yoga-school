import { HeroSection } from "@/components/home";
import { mapYttHubToHomeHero } from "@/content/mappers/ytt-hub";
import type { YttHubContent } from "@/content/types/shared-sections";

type YttHubHeroSectionProps = {
  hub: YttHubContent;
};

/**
 * YTT hub hero — homepage hero layout with hub-only CMS video/copy.
 *
 * @param props - Full hub document (maps to {@link HeroSection} content)
 */
export default function YttHubHeroSection({ hub }: YttHubHeroSectionProps) {
  return <HeroSection content={mapYttHubToHomeHero(hub)} />;
}
