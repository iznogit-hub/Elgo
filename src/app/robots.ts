import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"], // Protect admin and API routes
    },
    // TODO: Replace with your actual deployed domain
    sitemap: "https://bubblepops.com/sitemap.xml", 
  };
}