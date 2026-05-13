import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.178.249"],
  images: {
    remotePatterns: [
      // Generic HTTPS – covers all news-source CDN images
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
