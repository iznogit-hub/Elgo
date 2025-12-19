import { Metadata } from "next";
import { DashboardClient } from "@/components/pages/dashboard-client";
import { fetchDashboardData } from "@/app/actions/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Real-time system metrics.",
  openGraph: {
    images: [
      "/api/og?title=LIVE_FEED&section=DASHBOARD&description=Real-time%20metrics:%20Coding%20activity,%20music,%20and%20status.",
    ],
  },
};

// Revalidate data every 60 seconds to keep it fresh but cache-friendly
export const revalidate = 60;

export default async function DashboardPage() {
  const initialData = await fetchDashboardData();

  return <DashboardClient initialData={initialData} />;
}
