import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const orgName = searchParams.get("name");

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${session.accessToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (orgName) {
    try {
      const res = await fetch(`https://api.github.com/orgs/${orgName}`, { headers, cache: "no-store" });
      if (!res.ok) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }
      const org = await res.json();
      return NextResponse.json({
        id: org.id,
        login: org.login,
        avatar_url: org.avatar_url,
        description: org.description,
      });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
    }
  }

  const [userRes, orgsRes] = await Promise.all([
    fetch("https://api.github.com/user", { headers, cache: "no-store" }),
    fetch("https://api.github.com/user/orgs?per_page=100", { headers, cache: "no-store" }),
  ]);
// ... rest of the existing code ...

  if (!userRes.ok || !orgsRes.ok) {
    return NextResponse.json(
      { error: "GitHub API error", status: 502 },
      { status: 502 }
    );
  }

  const [userData, orgsData] = await Promise.all([
    userRes.json(),
    orgsRes.json(),
  ]);

  const userOrg = {
    id: userData.id,
    login: userData.login,
    avatar_url: userData.avatar_url,
    description: userData.bio || "Personal Account",
  };

  const orgs = orgsData.map((org: any) => ({
    id: org.id,
    login: org.login,
    avatar_url: org.avatar_url,
    description: org.description,
  }));

  return NextResponse.json([userOrg, ...orgs]);
}
