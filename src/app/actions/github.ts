/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

export async function getLatestCommit() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/t7sen/portfolio/commits/main",
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "t7sen-portfolio",
          Accept: "application/vnd.github.v3+json",
          // Use your custom variable name here
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
