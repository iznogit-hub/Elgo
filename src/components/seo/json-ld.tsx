import React from "react";

export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "t7sen",
    url: "https://t7sen.com",
    jobTitle: "Software Architect",
    image: "https://t7sen.com/Avatar.png",
    sameAs: [
      "https://github.com/t7sen",
      "https://x.com/T7ME_",
      "https://discord.com/users/170916597156937728",
    ],
    description:
      "Software Architect and Developer specializing in high-performance web applications and cyber security.",
    knowsAbout: [
      "Next.js",
      "React",
      "Cyber Security",
      "TypeScript",
      "Tailwind CSS",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
