import React from "react";

export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BubblePops Zaibatsu",
    url: "https://bubblepops.com",
    logo: "https://bubblepops.com/logo.png",
    description:
      "The elite algorithmic growth cartel for Instagram creators. Join the Inner Circle.",
    sameAs: [
      "https://instagram.com/bubblepops",
      "https://twitter.com/bubblepops",
    ],
    founders: [
      {
        "@type": "Person",
        name: "Amber",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}