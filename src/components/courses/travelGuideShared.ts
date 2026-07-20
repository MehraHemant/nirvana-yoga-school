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
 * @param content - Shared travel guide from MySQL
 */
export function mapTravelTopics(content: TravelGuideContent): TravelTopic[] {
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
