import { Suspense } from "react";
import {
  AchievementsShell,
  AchievementsContent,
} from "@/components/pages/achievements-client";
import { AchievementsSkeleton } from "@/components/skeletons/achievements-skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements | T7SEN",
  description:
    "Track your unlocked achievements and milestones within the T7SEN portfolio ecosystem.",
  openGraph: {
    title: "Achievements | T7SEN",
    description:
      "Track your unlocked achievements and milestones within the T7SEN portfolio ecosystem.",
  },
};

export default function AchievementsPage() {
  return (
    // 2. Shell loads INSTANTLY (Header + BG)
    <AchievementsShell>
      {/* 3. Content loads LATER (Stats + Grid) */}
      <Suspense fallback={<AchievementsSkeleton />}>
        <AchievementsContent />
      </Suspense>
    </AchievementsShell>
  );
}
