import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://satwire.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/settings", "/bookmarks"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
