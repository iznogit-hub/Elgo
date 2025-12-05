import { Metadata } from "next";
import { AboutClient } from "@/components/pages/about-client";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about t7sen, the developer behind this portfolio.",
};

export default function AboutPage() {
  return <AboutClient />;
}
