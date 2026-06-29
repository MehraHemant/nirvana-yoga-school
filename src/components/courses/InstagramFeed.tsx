"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Container } from "@/components/ui";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Comment,
  Heart,
  Instagram,
  MoreHorizontal,
  Play,
  Send,
} from "@/icons";
import type {
  InstagramFeed as InstagramFeedData,
  InstagramMedia,
} from "@/lib/instagram";
import { FALLBACK_INSTAGRAM_FEED } from "@/lib/instagram";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];

function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1000)}K`;
  if (value >= 1_000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days >= 1) return days === 1 ? "1 day ago" : `${days} days ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours >= 1) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  return "Just now";
}

function truncateCaption(text: string, max = 100) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function InstagramProfileBar({
  feed,
  profileUrl,
}: {
  feed: InstagramFeedData;
  profileUrl: string;
}) {
  const handle = feed.username ?? "nirvanayogaschool";
  const displayName = feed.displayName ?? "Nirvana Yoga School";
  const avatar = feed.media[0]?.image;
  const followers = feed.followersCount ?? 12_400;
  const following = feed.followingCount ?? 842;

  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <div className="relative mx-auto h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-linear-to-br from-[#feda75] via-[#fa7e1e] to-[#d62976] p-[3px] sm:mx-0 sm:h-20 sm:w-20">
          <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-white">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                fill
                unoptimized
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-sand">
                <Instagram size={28} className="text-primary" />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <p className="font-sans text-lg font-semibold text-ink">{handle}</p>

          <div className="mt-3 flex flex-wrap justify-center gap-5 font-sans text-sm text-ink sm:justify-start">
            <span>
              <strong className="font-semibold">{feed.postsCount}</strong> posts
            </span>
            <span>
              <strong className="font-semibold">{formatCount(followers)}</strong>{" "}
              followers
            </span>
            <span>
              <strong className="font-semibold">{formatCount(following)}</strong>{" "}
              following
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <p className="font-sans text-sm font-semibold text-ink">
              {displayName}
            </p>
            {feed.bio && (
              <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-ink/85">
                {feed.bio}
              </p>
            )}
            {feed.website && (
              <a
                href={
                  feed.website.startsWith("http")
                    ? feed.website
                    : `https://${feed.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sans text-sm font-semibold text-[#00376b] hover:underline"
              >
                {feed.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>

      <Button
        href={profileUrl}
        variant="primary"
        size="md"
        className="mx-auto shrink-0 sm:mx-0 lg:mt-2"
      >
        Follow on Instagram
      </Button>
    </div>
  );
}

const DOT_KEYS = [
  "d0",
  "d1",
  "d2",
  "d3",
  "d4",
  "d5",
  "d6",
  "d7",
  "d8",
  "d9",
] as const;

function CarouselDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1">
      {DOT_KEYS.slice(0, count).map((key, i) => (
        <span
          key={key}
          className={`rounded-full transition-all ${
            i === active
              ? "h-1.5 w-1.5 bg-[#0095f6]"
              : "h-1.5 w-1.5 bg-white/70"
          }`}
        />
      ))}
    </div>
  );
}

function PostVideo({
  poster,
  videoUrl,
  caption,
}: {
  poster: string;
  videoUrl: string;
  caption?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = async () => {
    setIsPlaying(true);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    try {
      await videoRef.current?.play();
    } catch {
      /* autoplay blocked — controls remain available */
    }
  };

  return (
    <div className="relative aspect-square bg-black">
      {!isPlaying ? (
        <>
          <Image
            src={poster}
            alt={caption || "Video thumbnail"}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/20"
            aria-label="Play video"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
              <Play size={22} className="text-white" />
            </span>
          </button>
        </>
      ) : (
        // biome-ignore lint/a11y/useMediaCaption: short social clip, no captions provided
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={caption || "Instagram video"}
        />
      )}
    </div>
  );
}

function PostMedia({
  item,
  caption,
}: {
  item: InstagramMedia;
  caption?: string;
}) {
  const slides = item.images.length > 0 ? item.images : [item.image];
  const isCarousel = slides.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const syncIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(index, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !isCarousel) return;
    el.addEventListener("scroll", syncIndex, { passive: true });
    return () => el.removeEventListener("scroll", syncIndex);
  }, [isCarousel, syncIndex]);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActiveIndex(index);
  };

  if (!isCarousel) {
    if (item.isVideo && item.videoUrl) {
      return (
        <PostVideo
          poster={slides[0]}
          videoUrl={item.videoUrl}
          caption={caption}
        />
      );
    }

    return (
      <a
        href={item.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-square bg-sand"
        aria-label={caption || "View on Instagram"}
      >
        <Image
          src={slides[0]}
          alt={caption || "Instagram post"}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </a>
    );
  }

  return (
    <div className="group/media relative aspect-square bg-sand">
      <div
        ref={scrollerRef}
        className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((src, slideIndex) => (
          <div
            key={`${item.id}-slide-${slideIndex}`}
            className="relative h-full min-w-full shrink-0 snap-center snap-always"
          >
            <Image
              src={src}
              alt={caption || "Instagram post slide"}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {activeIndex > 0 && (
        <button
          type="button"
          onClick={() => scrollTo(activeIndex - 1)}
          className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-sm transition-opacity group-hover/media:opacity-100"
          aria-label="Previous image"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {activeIndex < slides.length - 1 && (
        <button
          type="button"
          onClick={() => scrollTo(activeIndex + 1)}
          className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-sm transition-opacity group-hover/media:opacity-100"
          aria-label="Next image"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <CarouselDots count={slides.length} active={activeIndex} />
    </div>
  );
}

function InstagramPostCard({
  item,
  username,
  avatar,
  index,
}: {
  item: InstagramMedia;
  username: string;
  avatar?: string;
  index: number;
}) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={fadeUp}
      transition={{ delay: index * 0.06 }}
      className="overflow-hidden rounded-lg border border-[#dbdbdb] bg-white shadow-sm"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2.5 sm:px-4">
        <a
          href={item.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 items-center gap-2.5"
        >
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-[#feda75] via-[#fa7e1e] to-[#d62976] p-px">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  fill
                  unoptimized
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-sand">
                  <Instagram size={14} className="text-primary" />
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate font-sans text-[13px] font-semibold leading-tight text-ink">
              {username}
            </p>
            <p className="truncate font-sans text-[11px] leading-tight text-muted">
              Rishikesh, India
            </p>
          </div>
        </a>
        <button
          type="button"
          className="shrink-0 p-1 text-ink"
          aria-label="More options"
          tabIndex={-1}
        >
          <MoreHorizontal size={18} />
        </button>
      </header>

      {/* Media */}
      <PostMedia item={item} caption={item.caption} />

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-4">
        <div className="flex items-center gap-3.5">
          <span className="text-ink" aria-hidden="true">
            <Heart size={22} />
          </span>
          <span className="text-ink" aria-hidden="true">
            <Comment size={22} strokeWidth={2} />
          </span>
          <span className="text-ink" aria-hidden="true">
            <Send size={22} />
          </span>
        </div>
        <span className="text-ink" aria-hidden="true">
          <Bookmark size={22} />
        </span>
      </div>

      {/* Engagement + caption */}
      <div className="space-y-1.5 px-3 pb-3 sm:px-4 sm:pb-4">
        <p className="font-sans text-[13px] font-semibold text-ink">
          {formatCount(item.likesCount)} likes
        </p>

        {item.caption && (
          <p className="font-sans text-[13px] leading-snug text-ink">
            <span className="mr-1.5 font-semibold">{username}</span>
            <span className="text-ink/90">{truncateCaption(item.caption)}</span>
          </p>
        )}

        {item.commentsCount > 0 && (
          <a
            href={item.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-sans text-[13px] text-muted/80 hover:text-muted"
          >
            View all {formatCount(item.commentsCount)} comments
          </a>
        )}

        <p className="pt-0.5 font-sans text-[10px] uppercase tracking-wide text-muted/70">
          {timeAgo(item.timestamp)}
        </p>
      </div>
    </motion.article>
  );
}

function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#dbdbdb] bg-white">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-ink/5" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 animate-pulse rounded bg-ink/5" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-ink/5" />
        </div>
      </div>
      <div className="aspect-square animate-pulse bg-ink/5" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-ink/5" />
        <div className="h-3 w-full animate-pulse rounded bg-ink/5" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-ink/5" />
      </div>
    </div>
  );
}

export default function InstagramFeed() {
  const feed = FALLBACK_INSTAGRAM_FEED;
  const profileUrl = feed.profileUrl;
  const media = feed.media;
  const username = feed.username ?? "nirvanayogaschool";
  const avatar = media[0]?.image;

  return (
    <section
      id="instagram"
      className="relative overflow-x-clip bg-white py-20 sm:py-28"
    >
      <Container size="2xl">
        <div className="mb-10 flex items-center gap-3">
          <Instagram size={22} className="text-primary" />
          <h2 className="font-serif text-2xl text-ink sm:text-3xl">
            Instagram
          </h2>
        </div>

        {media.length > 0 ? (
          <>
            <InstagramProfileBar feed={feed} profileUrl={profileUrl} />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {media.map((item, index) => (
                <InstagramPostCard
                  key={item.id}
                  item={item}
                  username={username}
                  avatar={avatar}
                  index={index}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-center font-sans text-sm text-muted">
            Visit us on{" "}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Instagram
            </a>{" "}
            to see our latest posts.
          </p>
        )}
      </Container>
    </section>
  );
}
