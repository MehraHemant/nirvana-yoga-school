import type { Metadata } from "next";

export function courseMetadata(
  title: string,
  description: string,
  image: string,
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | Nirvana Yoga School`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
  };
}
