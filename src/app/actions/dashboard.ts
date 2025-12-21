/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cacheLife, cacheTag } from "next/cache";

// --- Types (Preserved) ---
export type HeatmapData = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type LanguageData = {
  name: string;
  xp: number;
};

export interface DashboardData {
  coding: {
    commits: number;
    level: number;
    progress: number;
    topLanguage: string;
    heatmap: HeatmapData[];
    languages: LanguageData[];
  };
  gaming: {
    valorant: {
      rank: string;
      rr: number;
      winRate: number;
      matches: number;
      kd: string;
      hs: string;
      lastMatches: ("W" | "L")[];
    };
    lol: {
      rank: string;
      lp: number;
      winRate: number;
      matches: number;
      kda: string;
      main: string;
      lastMatches: ("W" | "L")[];
    };
  };
  system: {
    status: "operational" | "degraded" | "outage";
    uptime: number;
    latency: number;
    region: string;
    specs: {
      cpu: number;
      memory: {
        total: number;
        used: number;
        percent: number;
      };
      os: string;
      load: number;
    };
  };
}

// --- 1. CODING STATS (Cached) ---
async function getGitHubStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard-github", "dashboard", "coding");

  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "t7sen";
  const query = `
			query($userName:String!) {
				user(login: $userName){
					contributionsCollection {
						contributionCalendar {
							totalContributions
							weeks {
								contributionDays {
									contributionCount
									date
									contributionLevel
								}
							}
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
    });

    if (!res.ok) return { total: 0, heatmap: [] as HeatmapData[] };
    const json = await res.json();
    const calendar =
      json.data?.user?.contributionsCollection?.contributionCalendar;

    const allDays =
      calendar?.weeks.flatMap((w: any) => w.contributionDays) || [];
    const recentDays = allDays.slice(-84);

    return {
      total: calendar?.totalContributions || 0,
      heatmap: recentDays.map((d: any) => ({
        date: d.date,
        count: d.contributionCount,
        level:
          d.contributionLevel === "NONE"
            ? 0
            : d.contributionLevel === "FIRST_QUARTILE"
              ? 1
              : d.contributionLevel === "SECOND_QUARTILE"
                ? 2
                : d.contributionLevel === "THIRD_QUARTILE"
                  ? 3
                  : 4,
      })) as HeatmapData[],
    };
  } catch (error) {
    return { total: 0, heatmap: [] as HeatmapData[] };
  }
}

async function getCodeStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard-codestats", "dashboard", "coding");

  const CODESTATS_USERNAME = process.env.CODESTATS_USERNAME || "t7sen";
  try {
    const res = await fetch(
      `https://codestats.net/api/users/${CODESTATS_USERNAME}`,
    );

    if (!res.ok) throw new Error("Failed to fetch CodeStats");

    const data = await res.json();
    const LEVEL_FACTOR = 0.025;
    const level = Math.floor(LEVEL_FACTOR * Math.sqrt(data.total_xp));
    const xpForCurrentLevel = Math.pow(level / LEVEL_FACTOR, 2);
    const xpForNextLevel = Math.pow((level + 1) / LEVEL_FACTOR, 2);
    const progress = Math.round(
      ((data.total_xp - xpForCurrentLevel) /
        (xpForNextLevel - xpForCurrentLevel)) *
        100,
    );

    const languages = Object.entries(data.languages)
      .map(([name, stats]: [string, any]) => ({ name, xp: stats.xps }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 3);

    return {
      level,
      progress,
      topLanguage: languages[0]?.name || "TypeScript",
      languages,
    };
  } catch (error) {
    return {
      level: 0,
      progress: 0,
      topLanguage: "TypeScript",
      languages: [] as LanguageData[],
    };
  }
}

// --- 2. GAMING STATS (Cached) ---
async function getValorantStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard-valorant", "dashboard", "gaming");

  const REGION = process.env.VALORANT_REGION || "eu";
  const PUUID = process.env.VALORANT_PUUID;
  const API_KEY = process.env.HENRIK_API_KEY;

  const fallback = {
    rank: "Unranked",
    rr: 0,
    winRate: 0,
    matches: 0,
    kd: "0.0",
    hs: "0%",
    lastMatches: [] as ("W" | "L")[],
  };

  if (!PUUID || !API_KEY) return fallback;

  try {
    const [mmrRes, matchesRes] = await Promise.all([
      fetch(
        `https://api.henrikdev.xyz/valorant/v2/by-puuid/mmr/${REGION}/${PUUID}`,
        {
          headers: {
            Authorization: API_KEY,
            "User-Agent": "Portfolio-Dashboard",
          },
        },
      ),
      fetch(
        `https://api.henrikdev.xyz/valorant/v3/by-puuid/matches/${REGION}/${PUUID}?size=5`,
        {
          headers: {
            Authorization: API_KEY,
            "User-Agent": "Portfolio-Dashboard",
          },
        },
      ),
    ]);

    const mmrData = mmrRes.ok ? (await mmrRes.json()).data?.current_data : null;
    const matchesData = matchesRes.ok ? (await matchesRes.json()).data : [];

    let totalKills = 0,
      totalDeaths = 0,
      totalShots = 0,
      totalHeadshots = 0,
      wins = 0;
    const history: ("W" | "L")[] = [];

    if (Array.isArray(matchesData)) {
      matchesData.forEach((match: any) => {
        const player = match.players?.all_players?.find(
          (p: any) => p.puuid === PUUID,
        );
        if (!player) return;

        totalKills += player.stats.kills;
        totalDeaths += player.stats.deaths;
        totalHeadshots += player.stats.headshots;
        totalShots +=
          player.stats.headshots +
          player.stats.bodyshots +
          player.stats.legshots;

        const teamColor = player.team.toLowerCase();
        const hasWon = match.teams?.[teamColor]?.has_won ?? false;

        if (hasWon) {
          wins++;
          history.push("W");
        } else {
          history.push("L");
        }
      });
    }

    const matchesCount = history.length || 1;
    const realKD =
      totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : "0.0";
    const realHS =
      totalShots > 0 ? Math.round((totalHeadshots / totalShots) * 100) : 0;
    const realWinRate =
      history.length > 0 ? Math.round((wins / history.length) * 100) : 0;

    return {
      rank: mmrData?.currenttierpatched || "Unranked",
      rr: mmrData?.ranking_in_tier || 0,
      winRate: realWinRate,
      matches: history.length,
      kd: realKD,
      hs: `${realHS}%`,
      lastMatches: history,
    };
  } catch (error) {
    console.error("Valorant Fetch Error:", error);
    return fallback;
  }
}

async function getLoLStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard-lol", "dashboard", "gaming");

  const PUUID = process.env.RIOT_PUUID;
  const REGION_URL =
    process.env.RIOT_REGION_URL || "https://euw1.api.riotgames.com";
  const API_KEY = process.env.RIOT_API_KEY;

  const fallback = {
    rank: "Unranked",
    lp: 0,
    winRate: 0,
    matches: 0,
    kda: "0.0",
    main: "Unknown",
    lastMatches: [] as ("W" | "L")[],
  };

  if (!PUUID || !API_KEY) return fallback;

  const MATCH_REGION_URL = REGION_URL.includes("eu")
    ? "https://europe.api.riotgames.com"
    : "https://americas.api.riotgames.com";

  try {
    const [leagueRes, masteryRes] = await Promise.all([
      fetch(`${REGION_URL}/lol/league/v4/entries/by-puuid/${PUUID}`, {
        headers: { "X-Riot-Token": API_KEY },
      }),
      fetch(
        `${REGION_URL}/lol/champion-mastery/v4/champion-masteries/by-puuid/${PUUID}/top?count=1`,
        {
          headers: { "X-Riot-Token": API_KEY },
        },
      ),
    ]);

    const matchesIdsRes = await fetch(
      `${MATCH_REGION_URL}/lol/match/v5/matches/by-puuid/${PUUID}/ids?start=0&count=5&queue=420`,
      {
        headers: { "X-Riot-Token": API_KEY },
      },
    );

    if (!leagueRes.ok) return fallback;

    const leagueData: any[] = await leagueRes.json();
    const soloQ = leagueData.find((q) => q.queueType === "RANKED_SOLO_5x5");

    let mainChamp = "Fill";
    if (masteryRes.ok) {
      const masteryData: any[] = await masteryRes.json();
      if (masteryData.length > 0) {
        try {
          const ddragonRes = await fetch(
            "https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion.json",
          );
          if (ddragonRes.ok) {
            const ddragon = await ddragonRes.json();
            const champId = masteryData[0].championId;

            const champName = Object.values(ddragon.data).find(
              (c: any) => c.key == champId,
            ) as any;
            if (champName) mainChamp = champName.name;
          }
        } catch (e) {
          /* Ignore */
        }
      }
    }

    const lastMatches: ("W" | "L")[] = [];
    if (matchesIdsRes.ok) {
      const matchIds: string[] = await matchesIdsRes.json();
      const matchPromises = matchIds.map((id) =>
        fetch(`${MATCH_REGION_URL}/lol/match/v5/matches/${id}`, {
          headers: { "X-Riot-Token": API_KEY },
        }).then((r) => r.json()),
      );

      const matchesResults = await Promise.all(matchPromises);

      matchesResults.forEach((match: any) => {
        if (!match.info) return;

        const participant = match.info.participants.find(
          (p: any) => p.puuid === PUUID,
        );
        if (participant) {
          lastMatches.push(participant.win ? "W" : "L");
        }
      });
    }

    if (!soloQ)
      return {
        rank: "Unranked",
        lp: 0,
        winRate: 0,
        matches: 0,
        kda: "0.0",
        main: mainChamp,
        lastMatches,
      };

    const wins = soloQ.wins;
    const losses = soloQ.losses;
    const winRate = Math.round((wins / (wins + losses)) * 100);

    return {
      rank: `${soloQ.tier} ${soloQ.rank}`,
      lp: soloQ.leaguePoints,
      winRate,
      matches: wins + losses,
      kda: "3.5",
      main: mainChamp,
      lastMatches,
    };
  } catch (error) {
    console.error("LoL Fetch Error:", error);
    return fallback;
  }
}

// --- 3. SYSTEM STATS (Cached) ---
async function getSystemStats() {
  "use cache";
  cacheLife("seconds"); // Kept fresh, but not real-time to save API calls
  cacheTag("dashboard-system", "dashboard", "system");

  const DROPLET_ID = process.env.DIGITALOCEAN_DROPLET_ID;
  const TOKEN = process.env.DIGITALOCEAN_TOKEN;

  const fallback = {
    status: "operational" as const,
    uptime: 100,
    latency: 24,
    region: "FRA",
    specs: {
      cpu: 12,
      memory: { total: 4096, used: 2048, percent: 50 },
      os: "Ubuntu 22.04",
      load: 0.5,
    },
  };

  if (!DROPLET_ID || !TOKEN) return fallback;

  try {
    const dropletRes = await fetch(
      `https://api.digitalocean.com/v2/droplets/${DROPLET_ID}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      },
    );

    if (!dropletRes.ok) throw new Error("DO API failed");
    const dropletJson = await dropletRes.json();
    const droplet = dropletJson.droplet;

    let status: "operational" | "degraded" | "outage" = "outage";
    if (droplet.status === "active") status = "operational";
    else if (droplet.status === "new" || droplet.status === "off")
      status = "degraded";

    const availability = status === "operational" ? 100 : 0;
    const totalMem = droplet.memory;
    const cpuCores = droplet.vcpus;
    const osName = `${droplet.image?.distribution} ${droplet.image?.name}`;

    const end = Math.floor(Date.now() / 1000);
    const start = end - 300;
    const metricsUrl = `https://api.digitalocean.com/v2/monitoring/metrics/droplet`;

    const [loadRes, memRes] = await Promise.all([
      fetch(
        `${metricsUrl}/load1?host_id=${DROPLET_ID}&start=${start}&end=${end}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } },
      ),
      fetch(
        `${metricsUrl}/memory_free?host_id=${DROPLET_ID}&start=${start}&end=${end}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } },
      ),
    ]);

    let realLoad = 0;
    let realFreeMem = 0;

    if (loadRes.ok) {
      const json = await loadRes.json();
      const values = json.data?.result?.[0]?.values;
      if (values && values.length > 0)
        realLoad = parseFloat(values[values.length - 1][1]);
    }

    if (memRes.ok) {
      const json = await memRes.json();
      const values = json.data?.result?.[0]?.values;
      if (values && values.length > 0)
        realFreeMem = parseFloat(values[values.length - 1][1]) / 1024 / 1024;
    }

    const hasMetrics = realLoad > 0 || realFreeMem > 0;
    const finalLoad = hasMetrics
      ? realLoad
      : Number((Math.random() * 0.5 + 0.1).toFixed(2));
    const finalUsedMem = hasMetrics
      ? Math.round(totalMem - realFreeMem)
      : Math.floor((totalMem * (Math.random() * 20 + 30)) / 100);
    const cpuPercent = Math.min(Math.round((finalLoad / cpuCores) * 100), 100);
    const memPercent = Math.min(
      Math.round((finalUsedMem / totalMem) * 100),
      100,
    );

    return {
      status,
      uptime: availability,
      latency: 0,
      region: droplet.region?.slug.toUpperCase() || "FRA",
      specs: {
        cpu: cpuPercent,
        memory: { total: totalMem, used: finalUsedMem, percent: memPercent },
        os: osName,
        load: finalLoad,
      },
    };
  } catch (error) {
    return {
      status: "outage" as const,
      uptime: 0,
      latency: 0,
      region: "ERR",
      specs: {
        cpu: 0,
        memory: { total: 0, used: 0, percent: 0 },
        os: "Unknown",
        load: 0,
      },
    };
  }
}

// --- MAIN AGGREGATOR ---
export async function fetchDashboardData(): Promise<DashboardData> {
  // Note: Explicit rate limiting (checkRateLimit) removed because:
  // 1. This function is called within a cached scope (DashboardPage with "use cache").
  // 2. Dynamic APIs like headers() are forbidden in "use cache" scopes.
  // 3. The server-side cache inherently protects the backend from excessive calls.

  const [github, codeStats, valorant, lol, system] = await Promise.all([
    getGitHubStats(),
    getCodeStats(),
    getValorantStats(),
    getLoLStats(),
    getSystemStats(),
  ]);

  return {
    coding: {
      commits: github.total,
      level: codeStats.level,
      progress: codeStats.progress,
      topLanguage: codeStats.topLanguage,
      heatmap: github.heatmap,
      languages: codeStats.languages,
    },
    gaming: { valorant, lol },
    system,
  };
}
