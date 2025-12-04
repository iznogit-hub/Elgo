import { Metadata } from "next";
import { AboutClient } from "@/components/pages/about-client";

export const metadata: Metadata = {
  title: "About", // This will become "About | t7sen" via the layout template
};

export default function AboutPage() {
  return <AboutClient />;
}
