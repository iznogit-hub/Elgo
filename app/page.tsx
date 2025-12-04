import {HomeClient} from "@/components/pages/home-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "T7SEN | Software Architect", // Explicit title for Home
};

export default function HomePage() {
  return <HomeClient />;
}
