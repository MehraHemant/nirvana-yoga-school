import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.nirvanayogaschoolindia.com",
        pathname: "/img/**",
      },
    ],
  },
};

export default nextConfig;
