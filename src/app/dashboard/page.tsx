import { Suspense } from "react";
import { Metadata } from "next";
import { DashboardClient } from "@/components/pages/dashboard-client";
import { fetchDashboardData } from "@/app/actions/dashboard";
import { Loader2 } from "lucide-react";

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
// This component halts rendering until data is ready, but because it's
// wrapped in Suspense, it won't block the whole page build.
async function DashboardContent() {
  const initialData = await fetchDashboardData();
  return <DashboardClient initialData={initialData} />;
}

// 2. FALLBACK: Loading State
function DashboardLoader() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
    </div>
  );
}

// 3. ROOT PAGE: Non-blocking shell
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <DashboardContent />
    </Suspense>
  );
}
