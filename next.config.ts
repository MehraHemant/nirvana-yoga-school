import type { NextConfig } from "next";
import { legacyRedirectForSlug } from "@/content/pages/path";
import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
  VENUE_SLUGS,
} from "@/content/pages/slugs";

const legacyRedirects = [
  ...RESIDENTIAL_COURSE_SLUGS.map((slug) =>
    legacyRedirectForSlug(slug, "course"),
  ),
  ...ONLINE_COURSE_SLUGS.map((slug) =>
    legacyRedirectForSlug(slug, "online"),
  ),
  ...RETREAT_SLUGS.map((slug) => legacyRedirectForSlug(slug, "retreat")),
  ...VENUE_SLUGS.map((slug) => legacyRedirectForSlug(slug, "venue")),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.nirvanayogaschoolindia.com",
      },
      {
        protocol: "https",
        hostname: "onlinecourses.nirvanayogaschoolindia.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
