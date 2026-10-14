import { HeroSection } from "@/components/home";
import { mapOnlineHubToHomeHero } from "@/content/mappers/online-hub";
import type { PageMinimalHero } from "@/content/types/page-modules";

type OnlineHubHeroSectionProps = {
  /** Online hub page-minimal hero from CMS modules */
  hero: PageMinimalHero;
};

/**
 * Online hub hero — same homepage {@link HeroSection} (video, overlay, type).
 *
 * @param props - Page-minimal hero module (maps to {@link HeroSection} content)
 */
export default function OnlineHubHeroSection({
  hero,
}: OnlineHubHeroSectionProps) {
  return <HeroSection content={mapOnlineHubToHomeHero(hero)} />;
}
