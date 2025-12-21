import { Suspense } from "react";
import { Metadata } from "next";
import { DashboardClient } from "@/components/pages/dashboard-client";
import { fetchDashboardData } from "@/app/actions/dashboard";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Real-time system metrics.",
  openGraph: {
    images: [
      "/api/og?title=LIVE_FEED&section=DASHBOARD&description=Real-time%20metrics:%20Coding%20activity,%20music,%20and%20status.",
    ],
  },
};

// 1. ISOLATE: Data fetching component
async function DashboardContent() {
  const initialData = await fetchDashboardData();
  return <DashboardClient initialData={initialData} />;
}

// 2. ROOT PAGE: Non-blocking shell with Skeleton Fallback
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
