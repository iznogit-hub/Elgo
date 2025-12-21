import { Metadata } from "next";
import { DashboardClient } from "@/components/pages/dashboard-client";
import { fetchDashboardData } from "@/app/actions/dashboard";
import { cacheLife } from "next/cache";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Real-time system metrics.",
  openGraph: {
    images: [
      "/api/og?title=LIVE_FEED&section=DASHBOARD&description=Real-time%20metrics:%20Coding%20activity,%20music,%20and%20status.",
    ],
  },
};

export default async function DashboardPage() {
  "use cache";
  // Use the 'seconds' profile for high-frequency updates (approx. 10s-60s validity)
  cacheLife("seconds");

  const initialData = await fetchDashboardData();

  return <DashboardClient initialData={initialData} />;
}
