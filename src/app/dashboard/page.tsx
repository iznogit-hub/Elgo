import { Suspense } from "react";
import { Metadata } from "next";
import {
  DashboardShell,
  DashboardMetrics,
} from "@/components/pages/dashboard-client";
import { fetchDashboardData } from "@/app/actions/dashboard";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Real-time system metrics.",
  openGraph: {
    images: [
      "/api/og?title=LIVE_FEED&section=DASHBOARD&description=Real-time%20metrics:%20Coding%20activity,%20gaming,%20and%20status.",
    ],
  },
};

// 1. ISOLATE: Data fetching component
async function AsyncDashboardMetrics() {
  const initialData = await fetchDashboardData();
  // Pass data to the "inner" part of the client component
  return <DashboardMetrics initialData={initialData} />;
}

// 2. ROOT PAGE:
// - Renders Shell IMMEDIATELY (Static)
// - Suspends ONLY the Grid (Dynamic)
export default function DashboardPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <AsyncDashboardMetrics />
      </Suspense>
    </DashboardShell>
  );
}
