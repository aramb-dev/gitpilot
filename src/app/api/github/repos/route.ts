import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as (Session & {
    accessToken?: string;
  }) | null;

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const selectedOrgs = searchParams.get("orgs")?.split(",").filter(Boolean) || [];

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${session.accessToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    // 1. Fetch User's personal repos (always fetched)
    const fetchPromises = [
      fetch("https://api.github.com/user/repos?per_page=100&affiliation=owner", { headers, cache: "no-store" })
    ];

    // 2. Fetch Org repos for selected organizations
    // Note: If the user themselves is in the 'orgs' list, they might already be covered by /user/repos?affiliation=owner
    // but the UI typically treats them as a separate entry. 
    // For simplicity, we fetch specifically for each requested org.
    selectedOrgs.forEach(org => {
        // Skip if it's the user's login (to avoid duplicates if we knew it, but we don't easily here without another fetch)
        // We'll deduplicate by full_name later.
        fetchPromises.push(
            fetch(`https://api.github.com/orgs/${org}/repos?per_page=100&sort=updated`, { headers, cache: "no-store" })
        );
    });

    const responses = await Promise.all(fetchPromises);
    
    let allData: any[] = [];
    for (const res of responses) {
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                allData = [...allData, ...data];
            }
        }
    }

    // Deduplicate by id and Sort by updated_at desc
    const seen = new Set();
    const uniqueRepos = allData.filter(repo => {
        const duplicate = seen.has(repo.id);
        seen.add(repo.id);
        return !duplicate;
    });

    const sortedRepos = uniqueRepos.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    const repos = sortedRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      full_name: repo.full_name,
      visibility: repo.private ? "Private" : "Public",
      stars: repo.stargazers_count,
      updated: new Date(repo.updated_at).toLocaleString(),
    }));

    return NextResponse.json(repos);
  } catch (error) {
    return NextResponse.json(
      { error: "GitHub API error", details: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }
}
