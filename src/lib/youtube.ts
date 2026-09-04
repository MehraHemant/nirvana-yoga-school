export type YouTubeOEmbed = {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  channel: string;
  channelUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

export function parseYouTubeId(input: string): string | null {
  try {
    const url = new URL(input);

    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] || null;
    }

    if (
      url.hostname.endsWith("youtube.com") ||
      url.hostname.endsWith("youtube-nocookie.com")
    ) {
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2] ?? null;
      }
      return url.searchParams.get("v");
    }
  } catch {
    return /^[\w-]{11}$/.test(input) ? input : null;
  }

  return null;
}

export function youTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** YouTube static thumbnail quality ladder (maxres/sd may 404; hq is reliable). */
export type YouTubeThumbQuality = "maxres" | "sd" | "hq";

const YT_THUMB_FILE: Record<YouTubeThumbQuality, string> = {
  maxres: "maxresdefault.jpg",
  sd: "sddefault.jpg",
  hq: "hqdefault.jpg",
};

/**
 * Builds a YouTube thumbnail URL. Defaults to `maxres` (`maxresdefault.jpg`).
 * Prefer maxres; fall back via {@link nextYouTubeThumbnailUrl} when it 404s.
 *
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality (default `maxres`)
 * @returns Absolute thumbnail URL on `i.ytimg.com`
 */
export function youTubeThumbnailUrl(
  videoId: string,
  quality: YouTubeThumbQuality = "maxres",
): string {
  return `https://i.ytimg.com/vi/${videoId}/${YT_THUMB_FILE[quality]}`;
}

/**
 * Steps down YouTube thumbnail quality after a failed image load:
 * maxres → sd → hq. Returns null when already at hq or not a YT thumb URL.
 *
 * @param src - Current thumbnail URL that failed to load
 * @returns Next-lower quality URL, or null
 */
export function nextYouTubeThumbnailUrl(src: string): string | null {
  if (src.includes("/maxresdefault.")) {
    return src.replace("/maxresdefault.", "/sddefault.");
  }
  if (src.includes("/sddefault.")) {
    return src.replace("/sddefault.", "/hqdefault.");
  }
  return null;
}

const LENGTH_SECONDS_PATTERN = /"lengthSeconds":"(\d+)"/;

// Registry of static video metadata to speed up builds and avoid prerender/scraping errors
export const YOUTUBE_METADATA_REGISTRY: Record<
  string,
  {
    title: string;
    author_name: string;
    author_url: string;
    thumbnail_url: string;
    durationSeconds: number;
  }
> = {
  PH2fv7TtRfc: {
    title: "NIRVANA YOGA SCHOOL RISHIKESH, INDIA",
    author_name: "Nirvana Yoga School",
    author_url: "https://www.youtube.com/@NirvanaYogaSchool",
    thumbnail_url: youTubeThumbnailUrl("PH2fv7TtRfc"),
    durationSeconds: 918,
  },
  RqG48joKLp8: {
    title: "Why I Chose Nirvana Yoga School: My yoga journey in Rishikesh",
    author_name: "Nirvana Yoga School",
    author_url: "https://www.youtube.com/@NirvanaYogaSchool",
    thumbnail_url: youTubeThumbnailUrl("RqG48joKLp8"),
    durationSeconds: 276,
  },
  Rcqr1gSe2uE: {
    title: "Beyond the Mat: Why This Yoga School Became My Home",
    author_name: "Nirvana Yoga School",
    author_url: "https://www.youtube.com/@NirvanaYogaSchool",
    thumbnail_url: youTubeThumbnailUrl("Rcqr1gSe2uE"),
    durationSeconds: 93,
  },
  TYal8a3zGow: {
    title:
      "Unplugged: Real Student Reviews of 200-Hour Yoga Training in Rishikesh l Nirvana Yoga School",
    author_name: "Nirvana Yoga School",
    author_url: "https://www.youtube.com/@NirvanaYogaSchool",
    thumbnail_url: youTubeThumbnailUrl("TYal8a3zGow"),
    durationSeconds: 1073,
  },
  "_NOezBf-LYs": {
    title: "Why Learning Yoga in Rishikesh is Life-Changing l Gurudev Dhruvaji",
    author_name: "Nirvana Yoga School",
    author_url: "https://www.youtube.com/@NirvanaYogaSchool",
    thumbnail_url: youTubeThumbnailUrl("_NOezBf-LYs"),
    durationSeconds: 827,
  },
  hHjuGhx8qSk: {
    title: "Online Yoga Teacher Training | Nirvana Yoga School",
    author_name: "Nirvana Yoga School",
    author_url: "https://www.youtube.com/@NirvanaYogaSchool",
    thumbnail_url: youTubeThumbnailUrl("hHjuGhx8qSk"),
    durationSeconds: 600,
  },
};

export async function fetchYouTubeOEmbed(
  watchUrl: string,
): Promise<YouTubeOEmbed> {
  const videoId = parseYouTubeId(watchUrl);
  if (videoId && YOUTUBE_METADATA_REGISTRY[videoId]) {
    const data = YOUTUBE_METADATA_REGISTRY[videoId];
    return {
      title: data.title,
      author_name: data.author_name,
      author_url: data.author_url,
      thumbnail_url: data.thumbnail_url,
      thumbnail_width: 1280,
      thumbnail_height: 720,
    };
  }

  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
    const response = await fetch(endpoint, { next: { revalidate: 86_400 } });

    if (!response.ok) {
      throw new Error(`YouTube oEmbed failed (${response.status})`);
    }

    const data = (await response.json()) as YouTubeOEmbed;
    // Prefer maxres for a sharper poster; client falls back on 404.
    if (videoId) {
      return {
        ...data,
        thumbnail_url: youTubeThumbnailUrl(videoId),
        thumbnail_width: 1280,
        thumbnail_height: 720,
      };
    }
    return data;
  } catch (error) {
    console.warn(`Failed to fetch YouTube oEmbed for ${watchUrl}:`, error);
    return {
      title: "Yoga Training - Nirvana Yoga School",
      author_name: "Nirvana Yoga School",
      author_url: "https://www.youtube.com/@NirvanaYogaSchool",
      // hq is reliable when oEmbed fails and we cannot rely on client fallback.
      thumbnail_url: youTubeThumbnailUrl(videoId ?? "PH2fv7TtRfc", "hq"),
      thumbnail_width: 480,
      thumbnail_height: 360,
    };
  }
}

/** Parses duration from the public watch page HTML (not in oEmbed). */
export async function fetchYouTubeDuration(videoId: string): Promise<number> {
  if (YOUTUBE_METADATA_REGISTRY[videoId]) {
    return YOUTUBE_METADATA_REGISTRY[videoId].durationSeconds;
  }

  try {
    const response = await fetch(youTubeWatchUrl(videoId), {
      next: { revalidate: 86_400 },
      headers: { "Accept-Language": "en" },
    });

    if (!response.ok) {
      throw new Error(`YouTube watch page failed (${response.status})`);
    }

    const html = await response.text();
    const match = LENGTH_SECONDS_PATTERN.exec(html);

    if (!match?.[1]) {
      throw new Error("Could not parse duration from watch page HTML");
    }

    return Number.parseInt(match[1], 10);
  } catch (error) {
    console.warn(`Failed to parse YouTube duration for ${videoId}:`, error);
    return 600; // 10 minutes default fallback
  }
}

export async function fetchYouTubeVideos(
  urls: ReadonlyArray<string>,
): Promise<YouTubeVideo[]> {
  return Promise.all(
    urls.map(async (url) => {
      const id = parseYouTubeId(url);
      if (!id) {
        throw new Error(`Invalid YouTube URL: ${url}`);
      }

      const watchUrl = youTubeWatchUrl(id);
      const [oembed, durationSeconds] = await Promise.all([
        fetchYouTubeOEmbed(watchUrl),
        fetchYouTubeDuration(id),
      ]);

      return {
        id,
        title: oembed.title,
        channel: oembed.author_name,
        channelUrl: oembed.author_url,
        thumbnailUrl: oembed.thumbnail_url,
        durationSeconds,
      };
    }),
  );
}
