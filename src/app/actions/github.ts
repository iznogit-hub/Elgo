/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cacheLife, cacheTag } from "next/cache";

export async function getLatestCommit() {
  "use cache";
  cacheLife("hours");
  cacheTag("github-latest");

  try {
    const res = await fetch(
      "https://api.github.com/repos/t7sen/portfolio/commits/main",
      {
        headers: {
          "User-Agent": "t7sen-portfolio",
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${process.env.GITPULSE_API_KEY}`,
        },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();

    return {
      hash: data.sha.substring(0, 7),
      message: data.commit.message,
      url: data.html_url,
    };
  } catch (error) {
    return null;
  }
}
