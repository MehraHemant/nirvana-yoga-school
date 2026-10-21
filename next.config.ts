import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { legacyRedirectForSlug } from "@/content/pages/path";
import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
  VENUE_SLUGS,
} from "@/content/pages/slugs";
import { cdnPublicHostname } from "./src/lib/cdn/cdn-env";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const legacyRedirects = [
  {
    source: "/gallery",
    destination: "/venue/course-venue",
    permanent: true as const,
  },
  {
    source: "/retreat/retreat-booking",
    destination: "/retreat-booking",
    permanent: true as const,
  },
  ...RESIDENTIAL_COURSE_SLUGS.map((slug) =>
    legacyRedirectForSlug(slug, "course"),
  ),
  ...ONLINE_COURSE_SLUGS.map((slug) => legacyRedirectForSlug(slug, "online")),
  ...RETREAT_SLUGS.map((slug) => legacyRedirectForSlug(slug, "retreat")),
  ...VENUE_SLUGS.map((slug) => legacyRedirectForSlug(slug, "venue")),
];

const cdnHost = cdnPublicHostname();

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin Turbopack root — avoids watching all of ~/Desktop when a stray lockfile exists there
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
    // Allow CMS Cloudinary video uploads through the admin proxy (images stay ≤4MB).
    proxyClientMaxBodySize: "100mb",
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    // Resize on the image's own CDN (mostly Cloudinary) instead of the Vercel
    // optimizer — see `src/lib/cdn/image-loader.ts`. Custom loader disables
    // `/_next/image`, so Cloudinary bytes are not fetched and re-encoded by Vercel.
    loader: "custom",
    loaderFile: "./src/lib/cdn/image-loader.ts",
    // Cap the srcset at the hero width. The default 3840 slot made full-bleed
    // photos request a larger file than the layout can show.
    deviceSizes: [640, 750, 828, 1080, 1200, 1536, 1920, 2048, 2400],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 512],
    qualities: [75, 85],
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
        // Live site serves some images (e.g. teacher photos) from ImageKit.
        protocol: "https",
        hostname: "ik.imagekit.io",
        // pathname: "/nirvanayogaschool/**",
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
      ...(cdnHost ? [{ protocol: "https" as const, hostname: cdnHost }] : []),
    ],
  },
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
