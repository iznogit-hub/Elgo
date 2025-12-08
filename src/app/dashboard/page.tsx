import { Metadata } from "next";
import { DashboardClient } from "@/components/pages/dashboard-client";
import { fetchDashboardData } from "@/app/actions/dashboard";

export const metadata: Metadata = {
  title: "Command Center",
  description: "Real-time metrics: Coding, Gaming, and System Status.",
};

// Revalidate data every 60 seconds to keep it fresh but cache-friendly
export const revalidate = 60;

export default async function DashboardPage() {
  const initialData = await fetchDashboardData();

  return <DashboardClient initialData={initialData} />;
}
