import { WHY_RISHIKESH_VIDEO_URL } from "@/constants/rishikesh";
import {
  fetchYouTubeDuration,
  fetchYouTubeOEmbed,
  parseYouTubeId,
  youTubeWatchUrl,
} from "@/lib/youtube";
import WhyRishikeshClient from "./WhyRishikeshClient";

export default async function WhyRishikeshSection() {
  const videoId = parseYouTubeId(WHY_RISHIKESH_VIDEO_URL);
  if (!videoId) return null;

  const watchUrl = youTubeWatchUrl(videoId);
  const [oembed, durationSeconds] = await Promise.all([
    fetchYouTubeOEmbed(watchUrl),
    fetchYouTubeDuration(videoId),
  ]);

  return (
    <section
      id="why-rishikesh"
      className="relative overflow-hidden bg-paper py-12 sm:py-16 md:py-20 lg:py-0 lg:h-[calc(100svh-5.5rem)] lg:min-h-[680px] lg:max-h-[850px] lg:flex lg:items-center"
    >
      <WhyRishikeshClient
        videoId={videoId}
        title={oembed.title}
        thumbnailUrl={oembed.thumbnail_url}
        durationSeconds={durationSeconds}
      />
    </section>
  );
}
