/** Types for relational lodging media, offers, dates, and food menus. */

import type {
  RoomCatalog,
  SharedGalleryImage,
} from "@/content/types/shared-sections";

/** Media image row from `media_images`. */
export type MediaImageRecord = {
  id: string;
  url: string;
  tag: string;
  title: string;
  alt: string;
  sort: number;
};

/** Media video row from `media_videos`. */
export type MediaVideoRecord = {
  id: string;
  url: string;
  tag: string;
  title: string;
  alt: string;
  poster: string | null;
  sort: number;
};

/** Per-page room offer (Live + price). */
export type PageRoomOfferRecord = {
  id: string;
  pageId: string;
  roomId: string;
  live: boolean;
  price: string;
  originalPrice: string;
  sort: number;
  /** Joined from rooms when loaded with room. */
  roomName?: string;
  roomSlug?: string;
  roomDescription?: string;
  roomFeatures?: string[];
  roomImages?: SharedGalleryImage[];
};

/** Dates-only batch for a page. */
export type PageDateBatchRecord = {
  id: string;
  pageId: string;
  dates: string;
  spaces: string;
  status: string;
  tone: "open" | "fast" | "last" | string;
  sort: number;
};

/** Section Live flags for accommodation / food. */
export type PageSectionKey = "accommodation" | "food";

export type PageSectionFlagRecord = {
  id: string;
  pageId: string;
  sectionKey: PageSectionKey;
  live: boolean;
};

/** Food menu with points and gallery. */
export type FoodMenuRecord = {
  id: string;
  catalog: RoomCatalog;
  title: string;
  description: string;
  dietaryNote: string;
  live: boolean;
  points: string[];
  gallery: SharedGalleryImage[];
};
