import { HeroSection } from "@/components/home";
import { mapOnlineHubToHomeHero } from "@/content/mappers/online-hub";
import type { PageMinimalHero } from "@/content/types/page-modules";

type OnlineHubHeroSectionProps = {
  /** Online hub page-minimal hero from CMS modules */
  hero: PageMinimalHero;
};

/**
 * Online hub hero — light digital band with hub copy, support line, and
 * browse/enquire CTA pair from {@link mapOnlineHubToHomeHero}.
 *
 * @param props - Page-minimal hero module (maps to {@link HeroSection} content)
 */
export default function OnlineHubHeroSection({
  hero,
}: OnlineHubHeroSectionProps) {
  return (
    <HeroSection content={mapOnlineHubToHomeHero(hero)} variant="online" />
  );
}
