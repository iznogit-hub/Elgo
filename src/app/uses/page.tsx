import { Metadata } from "next";
import { UsesClient } from "@/components/pages/uses-client";

export const metadata: Metadata = {
  title: "Uses",
  description: "Hardware, software, and configurations used by t7sen.",
};

export default function UsesPage() {
  return <UsesClient />;
}
