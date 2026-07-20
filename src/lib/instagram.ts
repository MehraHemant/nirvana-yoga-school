import { createEmptyInstagramFeed } from "@/lib/cms/structural-defaults";

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export type InstagramMedia = {
  id: string;
  caption: string;
  /** Primary display image — thumbnail for video, cover for carousel. */
  image: string;
  /** All slide URLs — scrollable when length > 1. */
  images: string[];
  /** MP4 URL when `isVideo` is true. */
  videoUrl?: string | null;
  mediaType: InstagramMediaType;
  isVideo: boolean;
  isMultipleImages: boolean;
  mediaCount: number;
  likesCount: number;
  commentsCount: number;
  permalink: string;
  timestamp: string;
  username: string | null;
};

export type InstagramFeed = {
  media: InstagramMedia[];
  username: string | null;
  displayName?: string;
  bio?: string;
  website?: string;
  profileUrl: string;
  postsCount: number;
  followersCount?: number;
  followingCount?: number;
};

type RawInstagramChild = {
  id: string;
  media_type: InstagramMediaType;
  media_url?: string;
  thumbnail_url?: string;
};

type RawInstagramMedia = {
  id: string;
  caption?: string;
  media_type: InstagramMediaType;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  username?: string;
  like_count?: number;
  comments_count?: number;
  children?: { data?: RawInstagramChild[] };
};

export const FALLBACK_INSTAGRAM_FEED = normalizeFeed(
  createEmptyInstagramFeed() as InstagramFeed,
);

const MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
  "username",
  "like_count",
  "comments_count",
  "children{id,media_type,media_url,thumbnail_url}",
].join(",");

function resolveHost(token: string): string {
  const configured = process.env.API_HOST;
  if (configured && configured !== "auto") return configured;
  return token.startsWith("IGA") ? "graph.instagram.com" : "graph.facebook.com";
}

function envInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function childImageUrl(child: RawInstagramChild): string | null {
  if (child.media_type === "VIDEO") {
    return child.thumbnail_url ?? child.media_url ?? null;
  }
  return child.media_url ?? child.thumbnail_url ?? null;
}

function resolveImages(item: RawInstagramMedia, cover: string): string[] {
  const childUrls = (item.children?.data ?? [])
    .map(childImageUrl)
    .filter((url): url is string => Boolean(url));

  if (childUrls.length > 0) return childUrls;
  return cover ? [cover] : [];
}

function mapMediaItem(item: RawInstagramMedia): InstagramMedia | null {
  const cover =
    item.media_type === "VIDEO"
      ? (item.thumbnail_url ?? item.media_url)
      : item.media_url;

  if (!cover) return null;

  const images = resolveImages(item, cover);
  const isMultipleImages =
    item.media_type === "CAROUSEL_ALBUM" || images.length > 1;
  const mediaCount = isMultipleImages ? Math.max(images.length, 2) : 1;

  return {
    id: item.id,
    caption: item.caption ?? "",
    image: images[0] ?? cover,
    images: images.length > 0 ? images : [cover],
    videoUrl: item.media_type === "VIDEO" ? (item.media_url ?? null) : null,
    mediaType: item.media_type,
    isVideo: item.media_type === "VIDEO",
    isMultipleImages,
    mediaCount,
    likesCount: item.like_count ?? 0,
    commentsCount: item.comments_count ?? 0,
    permalink: item.permalink,
    timestamp: item.timestamp,
    username: item.username ?? null,
  };
}

function normalizeMediaItem(item: InstagramMedia): InstagramMedia {
  const legacyDisplay = (item as InstagramMedia & { displayUrl?: string })
    .displayUrl;
  const image = item.image ?? legacyDisplay ?? "";
  const images = item.images?.length > 0 ? item.images : image ? [image] : [];

  return {
    ...item,
    image: images[0] ?? image,
    images,
    isVideo: item.isVideo ?? item.mediaType === "VIDEO",
    isMultipleImages:
      item.isMultipleImages ??
      (item.mediaType === "CAROUSEL_ALBUM" || images.length > 1),
    mediaCount: item.mediaCount ?? (images.length > 1 ? images.length : 1),
    likesCount: item.likesCount ?? 0,
    commentsCount: item.commentsCount ?? 0,
    videoUrl: item.videoUrl ?? null,
  };
}

function normalizeFeed(feed: InstagramFeed): InstagramFeed {
  const media = feed.media.map(normalizeMediaItem);

  return {
    ...feed,
    media,
    postsCount: feed.postsCount ?? media.length,
  };
}

/** Fetches the latest Instagram posts for the configured account. */
export async function fetchInstagramFeed(): Promise<InstagramFeed> {
  const token = process.env.ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    throw new Error("Missing ACCESS_TOKEN or INSTAGRAM_USER_ID env vars");
  }

  const version = process.env.API_VERSION || "v21.0";
  const limit = envInt(process.env.LIMIT, 8);
  const cacheTtl = envInt(process.env.CACHE_TTL, 3600);
  const host = resolveHost(token);

  const url = new URL(`https://${host}/${version}/${userId}/media`);
  url.searchParams.set("fields", MEDIA_FIELDS);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);

  const response = await fetch(url, { next: { revalidate: cacheTtl } });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Instagram API error ${response.status}: ${body}`);
  }

  const json = (await response.json()) as { data?: RawInstagramMedia[] };
  const media = (json.data ?? [])
    .map(mapMediaItem)
    .filter((item): item is InstagramMedia => item !== null);

  const username = media.find((item) => item.username)?.username ?? null;
  const profileUrl = username
    ? `https://www.instagram.com/${username}/`
    : "https://www.instagram.com/";

  return normalizeFeed({
    media,
    username,
    profileUrl,
    postsCount: media.length,
  });
}
