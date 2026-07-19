import { DEFAULT_TRAVEL_GUIDE } from "@/content/data/travel-guide-defaults";
import type {
  TravelGuideContent,
  TravelTopicIconKey,
} from "@/content/types/shared-sections";
import { Compass, Leaf, Plane, Shield, Wallet, Wifi } from "@/icons";

const ICON_MAP: Record<TravelTopicIconKey, typeof Shield> = {
  shield: Shield,
  plane: Plane,
  leaf: Leaf,
  compass: Compass,
  wallet: Wallet,
  wifi: Wifi,
};

export type TravelTopic = {
  id: string;
  title: string;
  tag: string;
  content: string;
  image: string;
  imageAlt: string;
  Icon: typeof Shield;
};

/**
 * Maps a CMS travel document into client topics with icon components.
 *
 * @param content - Shared travel guide from MySQL (or defaults)
 */
export function mapTravelTopics(
  content: TravelGuideContent = DEFAULT_TRAVEL_GUIDE,
): TravelTopic[] {
  return content.topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    tag: topic.tag,
    content: topic.content,
    image: topic.image,
    imageAlt: topic.imageAlt,
    Icon: ICON_MAP[topic.iconKey] ?? Compass,
  }));
}

/** Static fallback topics when CMS content is unavailable. */
export const TRAVEL_TOPICS: TravelTopic[] =
  mapTravelTopics(DEFAULT_TRAVEL_GUIDE);

export const QUICK_FACTS = DEFAULT_TRAVEL_GUIDE.quickFacts;

export const TRAVEL_INTRO = DEFAULT_TRAVEL_GUIDE.intro;
