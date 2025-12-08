/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { unstable_noStore as noStore } from "next/cache";

// --- Types ---
export interface DashboardData {
  coding: {
    commits: number;
    level: number;
    progress: number; // <--- NEW: Percentage to next level (0-100)
    topLanguage: string;
  };
  gaming: {
    valorant: { rank: string; rr: number; winRate: number; matches: number };
    lol: { rank: string; lp: number; winRate: number; matches: number };
  };
  system: {
    status: "operational" | "degraded" | "outage";
    uptime: number;
    latency: number;
    region: string;
  };
}

// --- 1. CODING STATS ---

async function fetchGitHubStats() {
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "t7sen";
  const query = `
    query($userName:String!) {
      user(login: $userName){
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { userName: GITHUB_USERNAME },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return 0;
    const json = await res.json();
    return (
      json.data?.user?.contributionsCollection?.contributionCalendar
        ?.totalContributions || 0
    );
  } catch (error) {
    return 0;
  }
}

interface CodeStatsResponse {
  total_xp: number;
  languages: Record<string, { xps: number }>;
}

async function fetchCodeStats() {
  const CODESTATS_USERNAME = process.env.CODESTATS_USERNAME || "t7sen";

  try {
    const res = await fetch(
      `https://codestats.net/api/users/${CODESTATS_USERNAME}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return { level: 0, progress: 0, topLanguage: "TypeScript" };

    const data: CodeStatsResponse = await res.json();

    // --- MATH: Calculate Level & Progress ---
    // Formula: Level = 0.025 * sqrt(XP)
    // Therefore: XP = (Level / 0.025)^2
    const LEVEL_FACTOR = 0.025;
    const level = Math.floor(LEVEL_FACTOR * Math.sqrt(data.total_xp));

    const xpForCurrentLevel = Math.pow(level / LEVEL_FACTOR, 2);
    const xpForNextLevel = Math.pow((level + 1) / LEVEL_FACTOR, 2);

    const progress = Math.round(
      ((data.total_xp - xpForCurrentLevel) /
        (xpForNextLevel - xpForCurrentLevel)) *
        100
    );

    // 2. Find Top Language
    const topLang = Object.entries(data.languages).reduce((a, b) =>
      a[1].xps > b[1].xps ? a : b
    )[0];

    return { level, progress, topLanguage: topLang };
  } catch (error) {
    return { level: 0, progress: 0, topLanguage: "TypeScript" };
  }
}

// --- 2. GAMING STATS ---

async function fetchValorantStats() {
  const REGION = process.env.VALORANT_REGION || "eu";
  const PUUID = process.env.VALORANT_PUUID;
  const API_KEY = process.env.HENRIK_API_KEY;

  if (!PUUID || !API_KEY)
    return { rank: "Config Missing", rr: 0, winRate: 0, matches: 0 };

  try {
    const res = await fetch(
      `https://api.henrikdev.xyz/valorant/v2/by-puuid/mmr/${REGION}/${PUUID}`,
      {
        headers: {
          Authorization: API_KEY,
          "User-Agent": "Portfolio-Dashboard",
        },
        next: { revalidate: 600 },
      }
    );

    if (!res.ok) return { rank: "Unranked", rr: 0, winRate: 0, matches: 0 };

    const json = await res.json();
    const data = json.data?.current_data;

    return {
      rank: data?.currenttierpatched || "Unranked",
      rr: data?.ranking_in_tier || 0,
      winRate: 50,
      matches: 0,
    };
  } catch (error) {
    return { rank: "Error", rr: 0, winRate: 0, matches: 0 };
  }
}

interface LeagueEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

async function fetchLoLStats() {
  const PUUID = process.env.RIOT_PUUID;
  const REGION_URL =
    process.env.RIOT_REGION_URL || "https://euw1.api.riotgames.com";
  const API_KEY = process.env.RIOT_API_KEY;

  if (!PUUID || !API_KEY)
    return { rank: "Unranked", lp: 0, winRate: 0, matches: 0 };

  try {
    const res = await fetch(
      `${REGION_URL}/lol/league/v4/entries/by-puuid/${PUUID}`,
      {
        headers: { "X-Riot-Token": API_KEY },
        next: { revalidate: 600 },
      }
    );

    if (!res.ok) return { rank: "Unranked", lp: 0, winRate: 0, matches: 0 };

    const data: LeagueEntry[] = await res.json();
    const soloQ = data.find((q) => q.queueType === "RANKED_SOLO_5x5");

    if (!soloQ) return { rank: "Unranked", lp: 0, winRate: 0, matches: 0 };

    const wins = soloQ.wins;
    const losses = soloQ.losses;
    const winRate = Math.round((wins / (wins + losses)) * 100);

    return {
      rank: `${soloQ.tier} ${soloQ.rank}`,
      lp: soloQ.leaguePoints,
      winRate,
      matches: wins + losses,
    };
  } catch (error) {
    return { rank: "Error", lp: 0, winRate: 0, matches: 0 };
  }
}

// --- 3. SYSTEM STATS ---

async function fetchSystemStats() {
  const DROPLET_ID = process.env.DIGITALOCEAN_DROPLET_ID;
  const TOKEN = process.env.DIGITALOCEAN_TOKEN;

  if (!DROPLET_ID || !TOKEN) {
    return {
      status: "operational" as const,
      uptime: 100,
      latency: 24,
      region: "FRA",
    };
  }

  try {
    // SWITCH: Using /v2/droplets/{id} instead of /v2/apps
    const res = await fetch(
      `https://api.digitalocean.com/v2/droplets/${DROPLET_ID}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error("DO API failed");

    const json = await res.json();
    const droplet = json.droplet;

    // Map Droplet status to Dashboard status
    let status: "operational" | "degraded" | "outage" = "outage";

    if (droplet.status === "active") status = "operational";
    else if (droplet.status === "new") status = "degraded";
    else status = "outage";

    return {
      status,
      uptime: status === "operational" ? 100 : 0, 
      latency: 24, // Mock latency (server-side calc is inaccurate)
      region: droplet.region?.slug.toUpperCase() || "FRA",
    };
  } catch (error) {
    return { status: "outage" as const, uptime: 0, latency: 0, region: "ERR" };
  }
}
// --- MAIN AGGREGATOR ---

export async function fetchDashboardData(): Promise<DashboardData> {
  noStore();

  const [githubCommits, codeStats, valorant, lol, system] = await Promise.all([
    fetchGitHubStats(),
    fetchCodeStats(),
    fetchValorantStats(),
    fetchLoLStats(),
    fetchSystemStats(),
  ]);

  return {
    coding: {
      commits: githubCommits,
      level: codeStats.level,
      progress: codeStats.progress,
      topLanguage: codeStats.topLanguage,
    },
    gaming: {
      valorant,
      lol,
    },
    system,
  };
}
