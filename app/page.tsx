import { HomeClient } from "@/components/pages/home-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "t7sen | Cyber Developer",
  description:
    "Welcome to the portfolio of t7sen, a passionate cyber developer.",
};

export default function HomePage() {
  return <HomeClient />;
}
