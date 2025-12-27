import { Suspense } from "react";
import {
  AchievementsShell,
  AchievementsContent,
} from "@/components/pages/achievements-client";
import { AchievementsSkeleton } from "@/components/skeletons/achievements-skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description: "System milestones and rank.",
  openGraph: {
    images: [
      "/api/og?title=TROPHY_ROOM&section=ACHIEVEMENTS&description=Track%20unlocked%20milestones%20and%20system%20rank.",
    ],
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
