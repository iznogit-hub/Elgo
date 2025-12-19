import { Metadata } from "next";
import { AboutClient } from "@/components/pages/about-client";

export const metadata: Metadata = {
  title: "About",
  description: "The architect behind the code.",
  openGraph: {
    images: [
      "/api/og?title=BIO_DATA&section=ABOUT&description=Architecting%20scalable%20systems%20and%20digital%20realities.",
    ],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
