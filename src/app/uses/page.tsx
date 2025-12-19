import { Metadata } from "next";
import { UsesClient } from "@/components/pages/uses-client";

export const metadata: Metadata = {
  title: "Uses",
  description: "Hardware and software loadout.",
  openGraph: {
    images: [
      "/api/og?title=ARMORY&section=USES&description=My%20essential%20hardware,%20software,%20and%20development%20stack.",
    ],
  },
};

export default function UsesPage() {
  return <UsesClient />;
}
