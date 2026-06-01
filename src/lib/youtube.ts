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

const LENGTH_SECONDS_PATTERN = /"lengthSeconds":"(\d+)"/;

export async function fetchYouTubeOEmbed(
  watchUrl: string,
): Promise<YouTubeOEmbed> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
  const response = await fetch(endpoint, { next: { revalidate: 86_400 } });

  if (!response.ok) {
    throw new Error(
      `YouTube oEmbed failed (${response.status}) for ${watchUrl}`,
    );
  }

  return response.json() as Promise<YouTubeOEmbed>;
}

/** Parses duration from the public watch page HTML (not in oEmbed). */
export async function fetchYouTubeDuration(videoId: string): Promise<number> {
  const response = await fetch(youTubeWatchUrl(videoId), {
    next: { revalidate: 86_400 },
    headers: { "Accept-Language": "en" },
  });

  if (!response.ok) {
    throw new Error(
      `YouTube watch page failed (${response.status}) for ${videoId}`,
    );
  }

  const html = await response.text();
  const match = LENGTH_SECONDS_PATTERN.exec(html);

  if (!match?.[1]) {
    throw new Error(`Could not parse duration for ${videoId}`);
  }

  return Number.parseInt(match[1], 10);
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
