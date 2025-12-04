import { HomeClient } from "@/components/pages/home-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "t7sen | Cyber Developer", // Explicit title for Home
};

export default function HomePage() {
  return <HomeClient />;
}
