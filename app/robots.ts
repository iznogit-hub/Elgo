import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Disallow specific paths if you have private dashboards later
      // disallow: '/private/',
    },
    sitemap: "https://t7sen.com/sitemap.xml",
  };
}
